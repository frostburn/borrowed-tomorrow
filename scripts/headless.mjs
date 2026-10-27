import {createServer} from 'vite';
const middle=process.argv[2]==='middle';
if(middle)process.argv.splice(2,1);
const server=await createServer({configFile:false,server:{middlewareMode:true},appType:'custom'});
try{const {run}=await server.ssrLoadModule(middle?'/src/headless/continue.ts':'/src/headless/run.ts');await run();}finally{await server.close();}
