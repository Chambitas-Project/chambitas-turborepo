import * as path from 'path';
import * as fs from 'fs';

/**
 * Busca recursivamente hacia arriba el archivo turbo.json para identificar la raíz del monorepo
 * y devuelve la ruta absoluta al archivo .env de esa raíz.
 */
export function getRootEnvPath(): string {
  let currentDir = process.cwd();
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    // Buscamos turbo.json como indicador de la raíz del monorepo
    if (fs.existsSync(path.join(currentDir, 'turbo.json'))) {
      return path.join(currentDir, '.env');
    }
    currentDir = path.dirname(currentDir);
  }

  // Fallback al directorio actual si no se encuentra la raíz
  return path.join(process.cwd(), '.env');
}

/**
 * Devuelve la configuración estándar de envFilePath para los microservicios.
 * Prioriza el .env de la raíz y permite overrides con un .env local.
 */
export function getEnvFiles(): string[] {
  return [getRootEnvPath(), '.env'];
}
