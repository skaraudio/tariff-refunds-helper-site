export const methodHandler = async (req, res, methodMap) => {
   try {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
         return res.status(200).end();
      }

      const handler = methodMap[req.method];
      if (!handler) {
         return res.status(405).json({ error: `Method ${req.method} not allowed` });
      }

      const result = await handler(req, res);
      if (result && !res.headersSent) {
         const status = result.status || 200;
         return res.status(status).json(result);
      }
   } catch (error) {
      console.error(`[API Error] ${req.method} ${req.url}:`, error?.message);
      if (!res.headersSent) {
         const status = error?.statusCode || 500;
         return res.status(status).json({
            error: error?.message || 'Internal server error'
         });
      }
   }
};
