import {createServer} from 'vite';
const server=await createServer({configFile:false,server:{middlewareMode:true},appType:'custom'});
try{const {run}=await server.ssrLoadModule('/src/headless/run.ts');await run();}finally{await server.close();}
