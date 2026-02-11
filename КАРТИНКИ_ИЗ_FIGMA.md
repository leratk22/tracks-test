# Как получить картинки карусели из Figma

Сейчас во всех слайдах используется временное изображение `phone-mockup.png`. Чтобы подставить **реальные экраны приложения** из макета:

## Способ 1: Автоматический экспорт (рекомендуется)

1. **Создайте Personal Access Token в Figma:**
   - Откройте https://www.figma.com/developers/api#access-tokens
   - Войдите в аккаунт Figma
   - Нажмите «Get personal access token»
   - Скопируйте токен

2. **Запустите скрипт:**
   ```bash
   cd /Users/valeriatkaceva/Documents/ProSebya/Tracks_Land
   export FIGMA_ACCESS_TOKEN="ваш-токен"
   python3 export_carousel_slides.py
   ```

3. **Обновите HTML** — скрипт сохранит в `public/images/` файлы slide-1.png … slide-7.png. Подставьте их в `index.html` вместо `phone-mockup.png`:
   - `slide-1.png` → Тесты
   - `slide-2.png` → Трекер состояния
   - `slide-3.png` → Статьи
   - и т.д.

## Способ 2: Ручной экспорт

1. Откройте макет: https://www.figma.com/design/z9cmA4j5jwS5PUgrSuY0z5/Tracks  
2. Найдите секцию 2 «Управляйте своим психологическим состоянием»  
3. Для каждой карточки карусели:
   - Выберите карточку целиком
   - ПКМ → Export → PNG → 2x → Export
   - Сохраните в `public/images/` как `slide-1.png`, `slide-2.png` и т.д.
4. Замените в `index.html` `phone-mockup.png` на `slide-1.png`, `slide-2.png` и т.д.

## Текущие цвета карточек (по макету)

- **Жёлтые (#fedb50):** Тесты, Трекер состояния, Аудиотренировки, Восстановительные ритмы  
- **Синие (#6BA3FF):** Статьи, Медитации, Практики самопомощи  

Если в макете другие цвета, укажите их — можно будет обновить.
