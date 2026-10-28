import {createServer} from 'vite';
const mode=['middle','support','five','six','seven'].includes(process.argv[2])?process.argv.splice(2,1)[0]:'early';
const server=await createServer({configFile:false,server:{middlewareMode:true},appType:'custom'});
try{const {run}=await server.ssrLoadModule(mode==='seven'?'/src/headless/seven-cli.ts':mode==='six'?'/src/headless/six-cli.ts':mode==='middle'||mode==='five'?'/src/headless/continue.ts':mode==='support'?'/src/headless/support-probe.ts':'/src/headless/run.ts');await run(mode==='five');}finally{await server.close();}
