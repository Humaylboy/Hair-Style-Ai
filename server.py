"""STRAND local server: serves the site and calls Cloudflare Workers AI (FLUX.2) for hairstyle edits. Credentials stay in .env."""
import base64,http.server,json,os,re,sys,urllib.error,urllib.request,uuid
os.chdir(os.path.dirname(os.path.abspath(__file__)))
def env():
    d=dict(os.environ)
    try:
        for l in open('.env'):
            if '=' in l and not l.lstrip().startswith('#'):k,v=l.strip().split('=',1);d.setdefault(k.strip(),v.strip().strip('"\''))
    except OSError:pass
    return d
E=env();ACC=E.get('CLOUDFLARE_ACCOUNT_ID','');TOK=E.get('CLOUDFLARE_API_TOKEN','')
MODELS=[m for m in E.get('MODELS','@cf/black-forest-labs/flux-2-klein-4b').split(',') if m]
def run(model,prompt,img,w,h,ref=None):
    b=uuid.uuid4().hex;f=[('prompt',prompt),('width',w),('height',h)]
    body=b''.join(f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode() for k,v in f)
    body+=f'--{b}\r\nContent-Disposition: form-data; name="input_image_0"; filename="photo.jpg"\r\nContent-Type: image/jpeg\r\n\r\n'.encode()+img+b'\r\n'+(f'--{b}\r\nContent-Disposition: form-data; name="input_image_1"; filename="ref.jpg"\r\nContent-Type: image/jpeg\r\n\r\n'.encode()+ref+b'\r\n' if ref else b'')+f'--{b}--\r\n'.encode()
    req=urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{ACC}/ai/run/{model}',body,{'Authorization':'Bearer '+TOK,'Content-Type':'multipart/form-data; boundary='+b,'User-Agent':'strand/1.0'})
    try:j=json.loads(urllib.request.urlopen(req,timeout=170).read())
    except urllib.error.HTTPError as e:
        raw=e.read()[:400].decode('utf8','ignore')
        try:raw=json.loads(raw)['errors'][0]['message']
        except Exception:pass
        hint=' (check the token has Workers AI permission)' if e.code in(401,403) else ''
        raise RuntimeError(f'{model.split("/")[-1]} HTTP {e.code}: {raw}{hint}')
    if not j.get('success',True) or not j.get('result',{}).get('image'):raise RuntimeError(f'{model.split("/")[-1]}: {j.get("errors") or "no image returned"}')
    return base64.b64decode(j['result']['image'])
ORIGIN=re.compile(r'^http://(localhost|127\.0\.0\.1)(:\d+)?$')
class H(http.server.SimpleHTTPRequestHandler):
    def cors(self):
        o=self.headers.get('Origin','')
        if ORIGIN.match(o):self.send_header('Access-Control-Allow-Origin',o);self.send_header('Access-Control-Allow-Headers','Content-Type');self.send_header('Access-Control-Allow-Methods','POST,OPTIONS')
    def do_OPTIONS(self):self.send_response(204);self.cors();self.end_headers()
    def log_message(self,f,*a):sys.stderr.write('  '+f%a+'\n')
    def do_GET(self):
        if self.path.split('?')[0].lstrip('/').startswith(('.env','server.py','.git')):return self.send_error(404)
        super().do_GET()
    def reply(self,code,obj):
        b=json.dumps(obj).encode();self.send_response(code);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(b)));self.cors();self.end_headers();self.wfile.write(b)
    def do_POST(self):
        if self.path!='/api/restyle':return self.send_error(404)
        if not(ACC and TOK):return self.reply(503,{'error':'Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to .env'})
        j=json.loads(self.rfile.read(int(self.headers.get('Content-Length',0))));img=base64.b64decode(j['image']);ref=base64.b64decode(j['ref']) if j.get('ref') else None
        cl=lambda v:max(256,min(1920,round(v*1.5/16)*16));w,h=cl(int(j.get('w',512))),cl(int(j.get('h',512)));errs=[]
        for m in MODELS:
            try:
                out=run(m,j['prompt'],img,w,h,ref);print('  OK',m)
                return self.reply(200,{'image':'data:'+('image/png' if out[:4]==b'\x89PNG' else 'image/jpeg')+';base64,'+base64.b64encode(out).decode()})
            except Exception as e:errs.append(str(e));print('  fail',e)
        self.reply(502,{'error':' | '.join(errs)})
if __name__=='__main__':
    print('STRAND at http://localhost:8000 | Cloudflare Workers AI:','ready' if ACC and TOK else 'NOT configured (.env)','| Ctrl+C to stop')
    http.server.ThreadingHTTPServer(('127.0.0.1',8000),H).serve_forever()
