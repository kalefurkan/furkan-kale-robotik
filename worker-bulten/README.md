# Bülten Worker

Siteden gelen e-postaları Cloudflare KV'ye yazar (`POST /abone`). E-posta göndermez.

- Kayıtları listele: `npx wrangler kv key list --binding ABONELER --prefix abone:`
- Bir kaydı sil (abonelikten çıkma isteği): `npx wrangler kv key delete --binding ABONELER "abone:ornek@mail.com"`
- Yayınla: `npx wrangler deploy`
