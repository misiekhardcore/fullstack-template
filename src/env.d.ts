declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string;
    SECRET: string;
    SENDGRID_KEY: string;
    SENDGRID_EMAIL: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_USERNAME: string;
    POSTGRES_PORT: string;
    POSTGRES_DB: string;
  }
}
