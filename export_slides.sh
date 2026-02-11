#!/bin/bash
# Скрипт для экспорта изображений слайдов из Figma
# Требуется FIGMA_ACCESS_TOKEN в переменных окружения

FILE_KEY="z9cmA4j5jwS5PUgrSuY0z5"
OUTPUT_DIR="public/images"

# Node IDs слайдов (нужно уточнить из макета)
declare -A SLIDES=(
    ["slide-1.png"]="21:32131"  # Тесты
    ["slide-2.png"]="22:33546"  # Трекер состояния
    ["slide-3.png"]="21:32583"  # Статьи
    ["slide-4.png"]="22:36870"  # Аудиотренировки
    ["slide-5.png"]="22:35178"  # Восстановительные ритмы
    ["slide-6.png"]="22:36109"  # Медитации
    ["slide-7.png"]="22:35183"  # Практики самопомощи
)

if [ -z "$FIGMA_ACCESS_TOKEN" ]; then
    echo "⚠️  FIGMA_ACCESS_TOKEN не установлен"
    echo "Установите токен: export FIGMA_ACCESS_TOKEN='your-token'"
    echo ""
    echo "Для получения токена: https://www.figma.com/developers/api#access-tokens"
    exit 1
fi

for filename in "${!SLIDES[@]}"; do
    node_id="${SLIDES[$filename]}"
    echo "Экспорт $filename (node: $node_id)..."
    
    # Используем Figma REST API для экспорта
    curl -s -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
        "https://api.figma.com/v1/images/$FILE_KEY?ids=$node_id&format=png&scale=2" \
        | jq -r '.images | to_entries[0].value' \
        | xargs curl -s -o "$OUTPUT_DIR/$filename"
    
    if [ $? -eq 0 ]; then
        echo "✅ $filename сохранён"
    else
        echo "❌ Ошибка при экспорте $filename"
    fi
done

echo ""
echo "Готово! Проверьте файлы в $OUTPUT_DIR"
