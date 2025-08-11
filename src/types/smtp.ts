export interface SmtpConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  secure: boolean;
  active: boolean;
  authTokens: { token: string; name: string }[];
} 

export interface PdfConfig {
  id: string;
  name: string;
  ipWhitelist: string[];
  authTokens: { token: string; name: string }[];
  active: boolean;
}