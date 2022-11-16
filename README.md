## Описание

Тестовый сервис для компании overgear.

У **пользователя** есть **счёт** в системе.
Его можно **пополнить** или **перевести** n сумму на счет другого пользователя.

Изначально в системе нет ни одного пользователя. Пользователи с Аккаунтами создаются с помощью АПИ.

Пополение счета может происходит из внешней системе (стороннюю
платежный сервис). Пользователь в сторонней системе выбирает удобный
способ и в случае успеха, сторонняя система вызывает webhook нашего
сервиса (стороннюю платежную систему - реализовывать не нужно).

### Стэк:

- NodeJS (Latest LTS)
- NestJS
- TypeScript
- TypeORM
- Swagger

### Архитектура:

- ~~Учитыватся горизонтальное масштабирование сервиса~~.
- Идемпотентность запросов.

## Запуск

Приложение запускается командой `yarn compose` или `docker-compose up --build`
Запускаются контейнер приложения и БД mysql.

Если локально не обнаружен образ mysql, то докер попробует скачать её. Значит может потребоваться интернет подключение.

Для запуска нужны свободные порты 3000 для доступа к сервису и 3306 для доступа к mysql.

### Доступ к АПИ

После запуска приложения можно посмотреть апи, сгенерированное с помощью swagger. Перейдите по по ссылке `http://localhost:3000/api/`

P.S. не забудьте удалить контейнеры с образами из докера после использования. 🙃

### Источники

- [stackacademy](https://stackacademy.tv/)
- [nginx.org](https://nginx.org/)
- [common pitfalls](https://www.nginx.com/resources/wiki/start/topics/tutorials/config_pitfalls)
- [nestjs.com](https://docs.nestjs.com/)
- [typeorm.io](https://typeorm.io/)
