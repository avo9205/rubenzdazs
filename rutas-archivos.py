import os
import json

def obtener_estructura_base():
    """Genera la plantilla JSON vacía para cada categoría (carpeta)."""
    return {
        "croptop": {
            "colores_disponibles": [
                {"nombre": "Marfil", "codigo_hex": "#FFFFF0", "imagenes": []},
                {"nombre": "Negro", "codigo_hex": "#000000", "imagenes": []},
                {"nombre": "Beige", "codigo_hex": "#F5F5DC", "imagenes": []}
            ]
        },
        "oversize": {
            "colores_disponibles": [
                {"nombre": "Marfil", "codigo_hex": "#FFFFF0", "imagenes": []},
                {"nombre": "Negro", "codigo_hex": "#000000", "imagenes": []},
                {"nombre": "Verde Oscuro", "codigo_hex": "#013220", "imagenes": []},
                {"nombre": "Azul Oscuro", "codigo_hex": "#00008B", "imagenes": []}
            ]
        }
    }

def clasificar_y_asignar(estructura_prenda, nombre_archivo, ruta_web, identificadores, mapeo_colores):
    """
    Busca patrones estrictos como 'cf-b', 'cf-m', 'cf-n' para evitar 
    falsos positivos con las letras del resto del nombre o la extensión .webp
    """
    nombre_min = nombre_archivo.lower()
    
    # Iteramos sobre cada identificador (ej: 'ce', 'cf')
    for iden in identificadores:
        # Iteramos sobre cada código de color (ej: 'b', 'n', 'm')
        for letra, nombre_color in mapeo_colores.items():
            # Construimos el patrón exacto: "cf-b", "cf-m", "cf-n", etc.
            patron_estricto = f"{iden}-{letra}"
            
            if patron_estricto in nombre_min:
                # Si coincide, buscamos el objeto del color en el JSON y guardamos la ruta
                for color_obj in estructura_prenda["colores_disponibles"]:
                    if color_obj["nombre"] == nombre_color:
                        color_obj["imagenes"].append(ruta_web)
                        return True # Archivo asignado correctamente
    return False

def construir_catalogo(ruta_base):
    catalogo_final = {}
    
    # Mapeos de códigos de color por prenda
    mapeo_croptop = {"b": "Beige", "n": "Negro", "m": "Marfil"}
    mapeo_oversize = {"m": "Marfil", "n": "Negro", "a": "Azul Oscuro", "v": "Verde Oscuro"}

    if not os.path.exists(ruta_base):
        print(f"Error: La ruta '{ruta_base}' no existe.")
        return catalogo_final

    for nombre_carpeta in os.listdir(ruta_base):
        ruta_carpeta = os.path.join(ruta_base, nombre_carpeta)
        
        if os.path.isdir(ruta_carpeta):
            # Crear la estructura limpia para la carpeta actual (ej: AJEDREZ)
            catalogo_final[nombre_carpeta] = obtener_estructura_base()
            
            for nombre_archivo in os.listdir(ruta_carpeta):
                ruta_archivo_completa = os.path.join(ruta_carpeta, nombre_archivo)
                
                if os.path.isfile(ruta_archivo_completa):
                    ruta_web = f"assets/img/productos/{nombre_carpeta}/{nombre_archivo}"
                    
                    # Intenta clasificar como Croptop usando el nuevo filtro estricto
                    asignado = clasificar_y_asignar(
                        estructura_prenda = catalogo_final[nombre_carpeta]["croptop"],
                        nombre_archivo = nombre_archivo,
                        ruta_web = ruta_web,
                        identificadores = ["ce", "cf"],
                        mapeo_colores = mapeo_croptop
                    )
                    
                    # Si no cumple el patrón de croptop, evalúa como Oversize
                    if not asignado:
                        clasificar_y_asignar(
                            estructura_prenda = catalogo_final[nombre_carpeta]["oversize"],
                            nombre_archivo = nombre_archivo,
                            ruta_web = ruta_web,
                            identificadores = ["oe", "of"],
                            mapeo_colores = mapeo_oversize
                        )

    return catalogo_final

# --- Ejecución del script ---
ruta_productos = 'assets/img/productos/'
productos_estructurados = construir_catalogo(ruta_productos)

# Guardar en el archivo JSON definitivo
with open('productos_categorias.json', 'w', encoding='utf-8') as archivo_json:
    json.dump(productos_estructurados, archivo_json, indent=4, ensure_ascii=False)

print("¡JSON corregido y generado exitosamente en 'productos_categorias.json'!")