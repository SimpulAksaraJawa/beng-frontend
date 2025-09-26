import "axios";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean; // Tambahkan properti _retry sebagai opsional
  }
}
