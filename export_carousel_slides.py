#!/usr/bin/env python3
"""
Скрипт для экспорта изображений слайдов карусели из Figma.
Требуется FIGMA_ACCESS_TOKEN: https://www.figma.com/developers/api#access-tokens

Запуск:
  export FIGMA_ACCESS_TOKEN="your-token"
  python3 export_carousel_slides.py
"""

import os
import sys
import json
import urllib.request
import urllib.error

FILE_KEY = "z9cmA4j5jwS5PUgrSuY0z5"
OUTPUT_DIR = "public/images"

# Node IDs карточек карусели (секция 2) — уточните в Figma через Inspect
SLIDES = [
    ("slide-1.png", "21:32131"),   # Тесты
    ("slide-2.png", "22:33546"),   # Трекер состояния
    ("slide-3.png", "21:32583"),   # Статьи
    ("slide-4.png", "22:36870"),   # Аудиотренировки
    ("slide-5.png", "22:35178"),   # Восстановительные ритмы
    ("slide-6.png", "22:36109"),   # Медитации
    ("slide-7.png", "22:35183"),   # Практики самопомощи
]


def export_slides():
    token = os.getenv("FIGMA_ACCESS_TOKEN")
    if not token:
        print("❌ FIGMA_ACCESS_TOKEN не установлен")
        print("\n1. Получите токен: https://www.figma.com/developers/api#access-tokens")
        print("2. Установите: export FIGMA_ACCESS_TOKEN='your-token'")
        print("3. Запустите: python3 export_carousel_slides.py")
        return False

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    node_ids = [nid for _, nid in SLIDES]

    url = f"https://api.figma.com/v1/images/{FILE_KEY}?ids={','.join(node_ids)}&format=png&scale=2"
    req = urllib.request.Request(url, headers={"X-Figma-Token": token})

    try:
        with urllib.request.urlopen(req) as r:
            data = json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        print(f"❌ Ошибка Figma API: {e.code} {e.reason}")
        return False
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False

    if "images" not in data:
        print(f"❌ Ответ API: {data}")
        return False

    images = data["images"]
    for filename, node_id in SLIDES:
        if node_id not in images:
            print(f"⚠️ Node {node_id} не найден")
            continue

        image_url = images[node_id]
        print(f"📥 {filename}...")
        try:
            with urllib.request.urlopen(image_url) as r:
                path = os.path.join(OUTPUT_DIR, filename)
                with open(path, "wb") as f:
                    f.write(r.read())
                print(f"   ✅ сохранён")
        except Exception as e:
            print(f"   ❌ {e}")

    print(f"\n✅ Готово. Обновите страницу: http://localhost:8000/index.html")
    return True


if __name__ == "__main__":
    sys.exit(0 if export_slides() else 1)
