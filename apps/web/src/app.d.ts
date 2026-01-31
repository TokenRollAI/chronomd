/// <reference types="@sveltejs/kit" />
/// <reference types="@cloudflare/workers-types" />

declare global {
  namespace App {
    interface Platform {
      env: {
        DB: import('@cloudflare/workers-types').D1Database;
        BUCKET: import('@cloudflare/workers-types').R2Bucket;
        ADMIN_PASSWORD_HASH: string;
        JWT_SECRET: string;
      };
    }
  }
}

export {};
