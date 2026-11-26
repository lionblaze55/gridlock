#!/usr/bin/env python3
"""Independent checks for a hand-built APK: zip/alignment, v2 signature, dex structure + disassembly, AXML decode, arsc decode."""
import sys, os, struct, sys, zipfile, hashlib, zlib, io
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

apk = open(sys.argv[1], 'rb').read()
R = lambda b, o, f: struct.unpack_from('<' + f, b, o)
ok = True
def bad(m):
    global ok; ok = False; print('  !! ' + m)

# ---------- zip + alignment
z = zipfile.ZipFile(io.BytesIO(apk)); print('ZIP entries:')
for zi in z.infolist():
    lh = zi.header_offset; n, e = R(apk, lh + 26, 'HH'); start = lh + 30 + n + e
    print(f'  {zi.filename:34s} {"stored" if zi.compress_type == 0 else "deflate"} size={zi.file_size} data@{start}' + (' aligned4' if start % 4 == 0 else ''))
    if zi.filename == 'resources.arsc' and (zi.compress_type != 0 or start % 4): bad('resources.arsc must be stored and 4-aligned')
    z.read(zi.filename)  # CRC check
if z.namelist()[0] != 'AndroidManifest.xml': print('  (manifest not first — fine)')

# ---------- v2 signature (re-derived from the spec)
ei = apk.rfind(b'PK\x05\x06'); cd_size, cd_off = R(apk, ei + 12, 'II')
assert apk[cd_off - 16:cd_off] == b'APK Sig Block 42', 'no signing block'
sz2 = R(apk, cd_off - 24, 'Q')[0]; bstart = cd_off - sz2 - 8; assert R(apk, bstart, 'Q')[0] == sz2
p = bstart + 8; v2 = None
while p < cd_off - 24:
    ln, = R(apk, p, 'Q'); pid, = R(apk, p + 8, 'I'); val = apk[p + 12:p + 8 + ln]; p += 8 + ln
    if pid == 0x7109871a: v2 = val
assert v2, 'no v2 block'
def lps(b):
    out, i = [], 0
    while i < len(b): n, = R(b, i, 'I'); out.append(b[i + 4:i + 4 + n]); i += 4 + n
    return out
signer = lps(lps(v2)[0])[0]; signed, sigs, pub = lps(signer)
digests, certs, attrs = lps(signed)
alg, dg = R(lps(digests)[0], 0, 'I')[0], lps(lps(digests)[0][4:])[0]
salg, sig = R(lps(sigs)[0], 0, 'I')[0], lps(lps(sigs)[0][4:])[0]
cert = x509.load_der_x509_certificate(lps(certs)[0]); pk = serialization.load_der_public_key(pub)
assert cert.public_key().public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo) == pub, 'cert/public key mismatch'
pk.verify(sig, signed, padding.PKCS1v15(), hashes.SHA256())
eocd = bytearray(apk[ei:]); eocd[16:20] = struct.pack('<I', bstart)
chunks = []
for s in (apk[:bstart], apk[cd_off:ei], bytes(eocd)):
    for k in range(0, len(s), 1 << 20): c = s[k:k + (1 << 20)]; chunks.append(hashlib.sha256(b'\xa5' + struct.pack('<I', len(c)) + c).digest())
want = hashlib.sha256(b'\x5a' + struct.pack('<I', len(chunks)) + b''.join(chunks)).digest()
print(f'V2 SIGNATURE: alg=0x{alg:04x}/0x{salg:04x} digest {"OK" if want == dg else "MISMATCH"}, RSA signature OK, cert "{cert.subject.rfc4514_string()}" sha256={hashlib.sha256(lps(certs)[0]).hexdigest()[:16]}…')
if want != dg: bad('content digest mismatch')

# ---------- dex (full structural check + per-method decode, shared with the builder)
d = z.read('classes.dex'); print('DEX:')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dexgen import check_dex
_errs, _rep, _ann = check_dex(d)
for l in _rep: print('  ' + l)
print('  method annotation:', _ann)
for e_ in _errs: bad('dex: ' + e_)

# ---------- AXML
m = z.read('AndroidManifest.xml'); print('MANIFEST:')
def pool(b, o):
    t, hs, size, cnt, sty, flags, ss, sts = R(b, o, 'HHIIIIII'); out = []
    for i in range(cnt):
        so_, = R(b, o + hs + 4 * i, 'I'); p_ = o + ss + so_; n, = R(b, p_, 'H'); out.append(b[p_ + 2:p_ + 2 + 2 * n].decode('utf-16-le'))
    return out, size
t, hs, total = R(m, 0, 'HHI'); assert t == 3 and total == len(m)
P, psz = pool(m, 8); o = 8 + psz; rmap = []
depth = 0; NSU = None
while o < len(m):
    t, hs, size = R(m, o, 'HHI')
    if t == 0x180: rmap = [R(m, o + 8 + 4 * k, 'I')[0] for k in range((size - 8) // 4)]
    elif t == 0x100: NSU = P[R(m, o + 20, 'I')[0]]
    elif t == 0x102:
        ns_, name, ast, asz, ac = R(m, o + 16, 'IIHHH'); attrs = []; ids = []
        for k in range(ac):
            ans, an, raw, vs, r0, dt, data = R(m, o + 36 + 20 * k, 'IIIHBBI'); rid = rmap[an] if an < len(rmap) else 0
            if ans != 0xffffffff: ids.append(rid)
            val = P[data] if dt == 3 else ('@0x%08x' % data if dt == 1 else ('true' if data else 'false') if dt == 0x12 else hex(data) if dt == 0x11 else str(data))
            attrs.append(f'{"android:" if ans != 0xffffffff else ""}{P[an]}="{val}"' + (f'[0x{rid:08x}]' if rid else ''))
        if ids != sorted(ids): bad(f'attributes of <{P[name]}> not sorted by id')
        print('  ' + '  ' * depth + f'<{P[name]} ' + ' '.join(attrs) + '>'); depth += 1
    elif t == 0x103: depth -= 1
    o += size
# ---------- arsc
a = z.read('resources.arsc'); t, hs, size, pc = R(a, 0, 'HHII'); assert t == 2 and size == len(a) and pc == 1
G, gsz = pool(a, 12); po = 12 + gsz; t, hs, psz, pid = R(a, po, 'HHII'); pname = a[po + 12:po + 12 + 256].decode('utf-16-le').rstrip('\0')
tso, lpt, kso, lpk = R(a, po + 268, 'IIII'); TS, _ = pool(a, po + tso); KS, _ = pool(a, po + kso)
o = po + hs + (kso - hs) + R(a, po + kso + 4, 'I')[0]
while o < po + psz:
    t, hs_, sz = R(a, o, 'HHI')
    if t == 0x201:
        tid, fl, _, ec, es = R(a, o + 8, 'BBHII'); dens, = R(a, o + 20 + 14, 'H'); eo, = R(a, o + hs_, 'I'); e = o + es + eo
        esz, efl, key, vsz, _, dt, data = R(a, e, 'HHIHBBI')
        print(f'RESOURCES: package 0x{pid:02x} "{pname}"  0x{pid:02x}{tid:02x}{0:04x} {TS[tid - 1]}/{KS[key]} = "{G[data]}" density=0x{dens:x}')
        if G[data] not in z.namelist(): bad('arsc path not in zip')
    o += sz
print('ALL CHECKS PASSED' if ok else 'PROBLEMS FOUND')
