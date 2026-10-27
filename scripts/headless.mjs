import {createServer} from 'vite';
const mode=['middle','support'].includes(process.argv[2])?process.argv.splice(2,1)[0]:'early';
const server=await createServer({configFile:false,server:{middlewareMode:true},appType:'custom'});
try{const {run}=await server.ssrLoadModule(mode==='middle'?'/src/headless/continue.ts':mode==='support'?'/src/headless/support-probe.ts':'/src/headless/run.ts');await run();}finally{await server.close();}
