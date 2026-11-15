#!/usr/bin/env python3
"""Build a signed Android APK for Gridlock without the Android SDK.

Writes every part by hand: a Dalvik classes.dex holding a tiny WebView
activity, a binary AndroidManifest.xml, a one-entry resources.arsc for the
launcher icon, the zip itself (with 4-byte alignment for resources.arsc),
and an APK Signature Scheme v2 block (RSA 2048 / SHA-256).

usage: build_apk.py <index.html> <icon.png> <out.apk> <keydir> <versionCode> <versionName>
"""
import hashlib, os, struct, sys, zipfile, zlib, io, datetime
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding

PKG = 'com.gridlock.sanvarro'
ACT = PKG + '.MainActivity'
LABEL = 'Gridlock: San Varro'
u8 = lambda v: struct.pack('<B', v); u16 = lambda v: struct.pack('<H', v); u32 = lambda v: struct.pack('<I', v & 0xffffffff); u64 = lambda v: struct.pack('<Q', v)

def uleb(v):
    out = bytearray()
    while True:
        b = v & 0x7f; v >>= 7
        if v: out.append(b | 0x80)
        else: out.append(b); return bytes(out)

def pad4(b): return b + b'\0' * (-len(b) % 4)

# ============================================================ DEX
def build_dex(js_back):
    CLS = 'L' + ACT.replace('.', '/') + ';'
    ACTV, WV, WS, WIN, VIEW, BUN, CTX, STR = 'Landroid/app/Activity;', 'Landroid/webkit/WebView;', 'Landroid/webkit/WebSettings;', 'Landroid/view/Window;', 'Landroid/view/View;', 'Landroid/os/Bundle;', 'Landroid/content/Context;', 'Ljava/lang/String;'
    URL = 'file:///android_asset/index.html'
    # (class, name, return, params)
    M = {
        'act_init': (ACTV, '<init>', 'V', ()), 'act_onCreate': (ACTV, 'onCreate', 'V', (BUN,)), 'act_getWindow': (ACTV, 'getWindow', WIN, ()),
        'act_setContentView': (ACTV, 'setContentView', 'V', (VIEW,)), 'act_onPause': (ACTV, 'onPause', 'V', ()), 'act_onResume': (ACTV, 'onResume', 'V', ()), 'act_onBack': (ACTV, 'onBackPressed', 'V', ()),
        'win_addFlags': (WIN, 'addFlags', 'V', ('I',)), 'win_decor': (WIN, 'getDecorView', VIEW, ()), 'view_sysui': (VIEW, 'setSystemUiVisibility', 'V', ('I',)),
        'wv_init': (WV, '<init>', 'V', (CTX,)), 'wv_settings': (WV, 'getSettings', WS, ()), 'wv_load': (WV, 'loadUrl', 'V', (STR,)), 'wv_onPause': (WV, 'onPause', 'V', ()), 'wv_onResume': (WV, 'onResume', 'V', ()),
        'ws_js': (WS, 'setJavaScriptEnabled', 'V', ('Z',)), 'ws_dom': (WS, 'setDomStorageEnabled', 'V', ('Z',)), 'ws_media': (WS, 'setMediaPlaybackRequiresUserGesture', 'V', ('Z',)),
        'my_init': (CLS, '<init>', 'V', ()), 'my_onCreate': (CLS, 'onCreate', 'V', (BUN,)), 'my_onPause': (CLS, 'onPause', 'V', ()), 'my_onResume': (CLS, 'onResume', 'V', ()), 'my_onBack': (CLS, 'onBackPressed', 'V', ()),
    }
    F = {'w': (CLS, 'w', WV)}
    shorty = lambda r, ps: ''.join('L' if t[0] in 'L[' else t for t in (r,) + tuple(ps))
    types = sorted({t for m in M.values() for t in (m[0], m[2]) + m[3]} | {CLS, WV, ACTV})
    protos_raw = {(m[2], m[3]) for m in M.values()}
    strings = set(types) | {m[1] for m in M.values()} | {shorty(r, p) for r, p in protos_raw} | {'w', URL, js_back}
    strings = sorted(strings)  # ASCII only, so code-unit order == byte order
    S = {s: i for i, s in enumerate(strings)}
    types.sort(key=lambda t: S[t]); TY = {t: i for i, t in enumerate(types)}
    protos = sorted(protos_raw, key=lambda p: (TY[p[0]], [TY[x] for x in p[1]]))
    PR = {p: i for i, p in enumerate(protos)}
    fields = sorted(F.values(), key=lambda f: (TY[f[0]], S[f[1]], TY[f[2]])); FI = {f: i for i, f in enumerate(fields)}
    meths = sorted(set(M.values()), key=lambda m: (TY[m[0]], S[m[1]], PR[(m[2], m[3])])); MI = {m: i for i, m in enumerate(meths)}
    mi = lambda k: MI[M[k]]; fw = FI[F['w']]

    def inv(op, k, regs):
        r = list(regs) + [0] * (5 - len(regs)); return [(len(regs) << 12) | (r[4] << 8) | op, mi(k), (r[3] << 12) | (r[2] << 8) | (r[1] << 4) | r[0]]
    INV_V, INV_S, INV_D = 0x6e, 0x6f, 0x70
    mro = lambda a: [(a << 8) | 0x0c]
    c16 = lambda a, v: [(a << 8) | 0x13, v & 0xffff]
    c4 = lambda a, v: [((v & 0xf) << 12) | (a << 8) | 0x12]
    cstr = lambda a, s: [(a << 8) | 0x1a, S[s]]
    newi = lambda a, t: [(a << 8) | 0x22, TY[t]]
    iput = lambda a, b: [(b << 12) | (a << 8) | 0x5b, fw]
    iget = lambda a, b: [(b << 12) | (a << 8) | 0x54, fw]
    ifeqz = lambda a, off: [(a << 8) | 0x38, off & 0xffff]
    RET = [0x000e]

    code = {}
    code['my_init'] = (1, 1, 1, inv(INV_D, 'act_init', [0]) + RET)
    # onCreate: v0-v2 locals, v3 this, v4 bundle
    code['my_onCreate'] = (5, 2, 2,
        inv(INV_S, 'act_onCreate', [3, 4]) + inv(INV_V, 'act_getWindow', [3]) + mro(0) + c16(1, 0x480) + inv(INV_V, 'win_addFlags', [0, 1]) +
        newi(0, WV) + inv(INV_D, 'wv_init', [0, 3]) + iput(0, 3) + inv(INV_V, 'wv_settings', [0]) + mro(1) +
        c4(2, 1) + inv(INV_V, 'ws_js', [1, 2]) + inv(INV_V, 'ws_dom', [1, 2]) + c4(2, 0) + inv(INV_V, 'ws_media', [1, 2]) +
        inv(INV_V, 'act_setContentView', [3, 0]) + cstr(1, URL) + inv(INV_V, 'wv_load', [0, 1]) + RET)
    # onPause: v0 local, v1 this
    code['my_onPause'] = (2, 1, 1, iget(0, 1) + ifeqz(0, 5) + inv(INV_V, 'wv_onPause', [0]) + inv(INV_S, 'act_onPause', [1]) + RET)
    # onResume: v0,v1 locals, v2 this
    code['my_onResume'] = (3, 1, 2, inv(INV_S, 'act_onResume', [2]) + iget(0, 2) + ifeqz(0, 5) + inv(INV_V, 'wv_onResume', [0]) +
        inv(INV_V, 'act_getWindow', [2]) + mro(0) + inv(INV_V, 'win_decor', [0]) + mro(0) + c16(1, 0x1706) + inv(INV_V, 'view_sysui', [0, 1]) + RET)
    # onBackPressed: v0,v1 locals, v2 this
    code['my_onBack'] = (3, 1, 2, iget(0, 2) + ifeqz(0, 8) + cstr(1, js_back) + inv(INV_V, 'wv_load', [0, 1]) + RET + inv(INV_S, 'act_onBack', [2]) + RET)

    # ---- layout
    n_s, n_t, n_p, n_f, n_m = len(strings), len(types), len(protos), len(fields), len(meths)
    off = 0x70
    o_str = off; off += 4 * n_s
    o_typ = off; off += 4 * n_t
    o_pro = off; off += 12 * n_p
    o_fld = off; off += 8 * n_f
    o_met = off; off += 8 * n_m
    o_cls = off; off += 32
    data_off = off
    data = bytearray()
    def at(): return data_off + len(data)
    def align4():
        while at() % 4: data.append(0)
    # code items
    align4(); o_code0 = at(); code_off = {}
    order = sorted(code, key=lambda k: mi(k))
    for k in order:
        align4(); regs, ins, outs, insns = code[k]; code_off[k] = at()
        data.extend(u16(regs) + u16(ins) + u16(outs) + u16(0) + u32(0) + u32(len(insns)) + b''.join(u16(x) for x in insns))
    # type lists
    align4(); o_tl0 = at(); tl_off = {}
    for p in protos:
        if p[1] and p[1] not in tl_off:
            align4(); tl_off[p[1]] = at(); data.extend(u32(len(p[1])) + b''.join(u16(TY[t]) for t in p[1]))
    n_tl = len(tl_off)
    # string data
    o_sd0 = at(); sd_off = []
    for s in strings:
        sd_off.append(at()); data.extend(uleb(len(s)) + s.encode('ascii') + b'\0')
    # class data
    o_cd = at()
    virt = sorted(['my_onCreate', 'my_onPause', 'my_onResume', 'my_onBack'], key=lambda k: mi(k))
    access = {'my_onCreate': 0x4, 'my_onPause': 0x4, 'my_onResume': 0x4, 'my_onBack': 0x1}
    cd = uleb(0) + uleb(1) + uleb(1) + uleb(len(virt)) + uleb(fw) + uleb(0x2)
    cd += uleb(mi('my_init')) + uleb(0x10001) + uleb(code_off['my_init'])
    prev = 0
    for k in virt:
        cd += uleb(mi(k) - prev) + uleb(access[k]) + uleb(code_off[k]); prev = mi(k)
    data.extend(cd)
    # map list
    align4(); o_map = at()
    items = [(0x0000, 1, 0), (0x0001, n_s, o_str), (0x0002, n_t, o_typ), (0x0003, n_p, o_pro), (0x0004, n_f, o_fld), (0x0005, n_m, o_met), (0x0006, 1, o_cls),
             (0x2001, len(code), o_code0), (0x1001, n_tl, o_tl0), (0x2002, n_s, o_sd0), (0x2000, 1, o_cd), (0x1000, 1, o_map)]
    items = [i for i in items if i[1]]
    data.extend(u32(len(items)) + b''.join(u16(t) + u16(0) + u32(n) + u32(o) for t, n, o in items))
    align4()
    # ---- id sections
    ids = bytearray()
    ids += b''.join(u32(o) for o in sd_off)
    ids += b''.join(u32(S[t]) for t in types)
    ids += b''.join(u32(S[shorty(r, ps)]) + u32(TY[r]) + u32(tl_off.get(ps, 0) if ps else 0) for r, ps in protos)
    ids += b''.join(u16(TY[c]) + u16(TY[t]) + u32(S[n]) for c, n, t in fields)
    ids += b''.join(u16(TY[c]) + u16(PR[(r, ps)]) + u32(S[n]) for c, n, r, ps in meths)
    ids += u32(TY[CLS]) + u32(0x1) + u32(TY[ACTV]) + u32(0) + u32(0xffffffff) + u32(0) + u32(o_cd) + u32(0)
    assert 0x70 + len(ids) == data_off
    file_size = data_off + len(data)
    hdr = bytearray(b'dex\n035\0' + b'\0' * 24 + u32(file_size) + u32(0x70) + u32(0x12345678) + u32(0) + u32(0) + u32(o_map) +
                    u32(n_s) + u32(o_str) + u32(n_t) + u32(o_typ) + u32(n_p) + u32(o_pro) + u32(n_f) + u32(o_fld) + u32(n_m) + u32(o_met) + u32(1) + u32(o_cls) +
                    u32(len(data)) + u32(data_off))
    assert len(hdr) == 0x70
    dex = bytearray(hdr + ids + data)
    dex[12:32] = hashlib.sha1(dex[32:]).digest()
    dex[8:12] = u32(zlib.adler32(bytes(dex[12:])))
    return bytes(dex), dict(strings=strings, types=types, protos=protos, fields=fields, meths=meths, code=code)

# ============================================================ string pool (UTF-16)
def string_pool(strs):
    offs, body = [], bytearray()
    for s in strs:
        offs.append(len(body)); e = s.encode('utf-16-le'); body += u16(len(s)) + e + b'\0\0'
    hsz = 28; start = hsz + 4 * len(strs)
    chunk = b''.join(u32(o) for o in offs) + body
    chunk = pad4(chunk)
    return u16(0x0001) + u16(hsz) + u32(hsz + len(chunk)) + u32(len(strs)) + u32(0) + u32(0) + u32(start) + u32(0) + chunk

# ============================================================ binary manifest
ATTR = {'theme': 0x01010000, 'label': 0x01010001, 'icon': 0x01010002, 'name': 0x01010003, 'exported': 0x01010010, 'launchMode': 0x0101001d, 'screenOrientation': 0x0101001e,
        'configChanges': 0x0101001f, 'minSdkVersion': 0x0101020c, 'versionCode': 0x0101021b, 'versionName': 0x0101021c, 'targetSdkVersion': 0x01010270, 'usesCleartextTraffic': 0x010104ec}
NS = 'http://schemas.android.com/apk/res/android'
STR_T, REF_T, INT_T, HEX_T, BOOL_T = 0x03, 0x01, 0x10, 0x11, 0x12

def build_manifest(vcode, vname):
    # tree: (tag, [(android?, name, type, value)], children)
    A = lambda n, t, v: (True, n, t, v)
    tree = ('manifest', [A('versionCode', INT_T, vcode), A('versionName', STR_T, vname), (False, 'package', STR_T, PKG)], [
        ('uses-sdk', [A('minSdkVersion', INT_T, 24), A('targetSdkVersion', INT_T, 34)], []),
        ('uses-permission', [A('name', STR_T, 'android.permission.INTERNET')], []),
        ('uses-permission', [A('name', STR_T, 'android.permission.ACCESS_NETWORK_STATE')], []),
        ('uses-permission', [A('name', STR_T, 'android.permission.ACCESS_WIFI_STATE')], []),
        ('application', [A('theme', REF_T, 0x0103000a), A('label', STR_T, LABEL), A('icon', REF_T, 0x7f010000), A('usesCleartextTraffic', BOOL_T, True)], [
            ('activity', [A('name', STR_T, ACT), A('exported', BOOL_T, True), A('launchMode', INT_T, 1), A('screenOrientation', INT_T, 13), A('configChanges', HEX_T, 0xff0)], [
                ('intent-filter', [], [
                    ('action', [A('name', STR_T, 'android.intent.action.MAIN')], []),
                    ('category', [A('name', STR_T, 'android.intent.category.LAUNCHER')], [])])])])])
    used_attrs, others = [], []
    def walk(n):
        tag, attrs, kids = n
        others.append(tag)
        for a in attrs:
            if a[0]: used_attrs.append(a[1])
            else: others.append(a[1])
            if a[2] == STR_T: others.append(a[3])
        for k in kids: walk(k)
    walk(tree)
    attr_names = sorted(set(used_attrs), key=lambda n: ATTR[n])
    pool = attr_names + [s for s in dict.fromkeys(['android', NS] + others) if s not in attr_names]
    SI = {s: i for i, s in enumerate(pool)}
    out = bytearray()
    out += string_pool(pool)
    out += u16(0x0180) + u16(8) + u32(8 + 4 * len(attr_names)) + b''.join(u32(ATTR[n]) for n in attr_names)
    out += u16(0x0100) + u16(16) + u32(24) + u32(1) + u32(0xffffffff) + u32(SI['android']) + u32(SI[NS])
    def emit(n):
        tag, attrs, kids = n
        attrs = sorted(attrs, key=lambda a: ATTR[a[1]] if a[0] else 0x7fffffff)
        body = bytearray()
        for isns, name, t, v in attrs:
            raw = SI[v] if t == STR_T else 0xffffffff
            data = SI[v] if t == STR_T else (0xffffffff if (t == BOOL_T and v) else (0 if t == BOOL_T else v))
            body += u32(SI[NS] if isns else 0xffffffff) + u32(SI[name]) + u32(raw) + u16(8) + u8(0) + u8(t) + u32(data)
        out.extend(u16(0x0102) + u16(16) + u32(36 + len(body)) + u32(1) + u32(0xffffffff) + u32(0xffffffff) + u32(SI[tag]) + u16(0x14) + u16(0x14) + u16(len(attrs)) + u16(0) + u16(0) + u16(0) + body)
        for k in kids: emit(k)
        out.extend(u16(0x0103) + u16(16) + u32(24) + u32(1) + u32(0xffffffff) + u32(0xffffffff) + u32(SI[tag]))
    emit(tree)
    out += u16(0x0101) + u16(16) + u32(24) + u32(1) + u32(0xffffffff) + u32(SI['android']) + u32(SI[NS])
    return u16(0x0003) + u16(8) + u32(8 + len(out)) + bytes(out), pool

# ============================================================ resources.arsc (one drawable: the icon)
ICON_PATH = 'res/drawable-nodpi-v4/icon.png'
def build_arsc():
    gpool = string_pool([ICON_PATH]); tpool = string_pool(['drawable']); kpool = string_pool(['icon'])
    spec = u16(0x0202) + u16(16) + u32(16 + 4) + u8(1) + u8(0) + u16(1) + u32(1) + u32(0)
    config = bytearray(64); config[0:4] = u32(64); config[14:16] = u16(0xffff)  # density = nodpi
    hsz = 8 + 1 + 1 + 2 + 4 + 4 + 64
    entry = u16(8) + u16(0) + u32(0) + u16(8) + u8(0) + u8(STR_T) + u32(0)
    typ = u16(0x0201) + u16(hsz) + u32(hsz + 4 + len(entry)) + u8(1) + u8(0) + u16(0) + u32(1) + u32(hsz + 4) + bytes(config) + u32(0) + entry
    name = PKG.encode('utf-16-le'); name = name + b'\0' * (256 - len(name))
    ph = 288
    pkg_body = tpool + kpool + spec + typ
    pkg = u16(0x0200) + u16(ph) + u32(ph + len(pkg_body)) + u32(0x7f) + name + u32(ph) + u32(1) + u32(ph + len(tpool)) + u32(1) + u32(0) + pkg_body
    return u16(0x0002) + u16(12) + u32(12 + len(gpool) + len(pkg)) + u32(1) + gpool + pkg

# ============================================================ key
def load_key(keydir):
    os.makedirs(keydir, exist_ok=True); kp, cp = os.path.join(keydir, 'gridlock-key.pem'), os.path.join(keydir, 'gridlock-cert.pem')
    if not os.path.exists(kp):
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        nm = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, 'Gridlock San Varro'), x509.NameAttribute(NameOID.ORGANIZATION_NAME, 'Gridlock')])
        now = datetime.datetime(2026, 1, 1, tzinfo=datetime.timezone.utc)
        cert = x509.CertificateBuilder().subject_name(nm).issuer_name(nm).public_key(key.public_key()).serial_number(x509.random_serial_number()) \
            .not_valid_before(now).not_valid_after(now + datetime.timedelta(days=365 * 40)).sign(key, hashes.SHA256())
        open(kp, 'wb').write(key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
        open(cp, 'wb').write(cert.public_bytes(serialization.Encoding.PEM))
    key = serialization.load_pem_private_key(open(kp, 'rb').read(), None); cert = x509.load_pem_x509_certificate(open(cp, 'rb').read())
    return key, cert

# ============================================================ zip + v2 signature
def build_zip(entries):
    """entries: list of (name, bytes, stored, align)"""
    bio = io.BytesIO(); z = zipfile.ZipFile(bio, 'w')
    for name, data, stored, align in entries:
        zi = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0)); zi.create_system = 0
        zi.compress_type = zipfile.ZIP_STORED if stored else zipfile.ZIP_DEFLATED
        if align:
            hdr_end = bio.tell() + 30 + len(name.encode()) + 4
            n = (-hdr_end) % align
            zi.extra = u16(0xd935) + u16(n) + b'\0' * n
        z.writestr(zi, data, compresslevel=9 if not stored else None)
    z.close(); return bio.getvalue()

def lp(b): return u32(len(b)) + b

def eocd_info(apk):
    i = apk.rfind(b'PK\x05\x06'); cd_size, cd_off = struct.unpack('<II', apk[i + 12:i + 20]); return i, cd_off, cd_size

def v2_digest(apk, cd_off, eocd_i):
    eocd = bytearray(apk[eocd_i:]); eocd[16:20] = u32(cd_off)
    sections = [apk[:cd_off], apk[cd_off:eocd_i], bytes(eocd)]
    chunks = []
    for s in sections:
        for k in range(0, len(s), 1 << 20):
            c = s[k:k + (1 << 20)]; chunks.append(hashlib.sha256(b'\xa5' + u32(len(c)) + c).digest())
    return hashlib.sha256(b'\x5a' + u32(len(chunks)) + b''.join(chunks)).digest()

def sign_v2(apk, key, cert):
    eocd_i, cd_off, cd_size = eocd_info(apk); assert cd_off + cd_size == eocd_i
    dg = v2_digest(apk, cd_off, eocd_i)
    ALG = 0x0103
    signed = lp(lp(u32(ALG) + lp(dg))) + lp(lp(cert.public_bytes(serialization.Encoding.DER))) + lp(b'')
    sig = key.sign(signed, padding.PKCS1v15(), hashes.SHA256())
    pub = key.public_key().public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)
    signer = lp(signed) + lp(lp(u32(ALG) + lp(sig))) + lp(pub)
    value = lp(lp(signer))
    pairs = u64(4 + len(value)) + u32(0x7109871a) + value
    size = len(pairs) + 8 + 16
    block = u64(size) + pairs + u64(size) + b'APK Sig Block 42'
    eocd = bytearray(apk[eocd_i:]); eocd[16:20] = u32(cd_off + len(block))
    return apk[:cd_off] + block + apk[cd_off:eocd_i] + bytes(eocd)

def main():
    html, icon, out, keydir, vcode, vname = sys.argv[1:7]
    js_back = 'javascript:window.onAndroidBack&&window.onAndroidBack()'
    dex, info = build_dex(js_back)
    man, pool = build_manifest(int(vcode), vname)
    arsc = build_arsc()
    entries = [('AndroidManifest.xml', man, False, 0), ('classes.dex', dex, False, 0), ('resources.arsc', arsc, True, 4),
               (ICON_PATH, open(icon, 'rb').read(), True, 4), ('assets/index.html', open(html, 'rb').read(), False, 0)]
    key, cert = load_key(keydir)
    apk = sign_v2(build_zip(entries), key, cert)
    open(out, 'wb').write(apk)
    open(out + '.dex', 'wb').write(dex); open(out + '.manifest', 'wb').write(man); open(out + '.arsc', 'wb').write(arsc)
    print(out, len(apk), 'bytes; dex', len(dex), 'manifest', len(man), 'arsc', len(arsc))

if __name__ == '__main__':
    main()
