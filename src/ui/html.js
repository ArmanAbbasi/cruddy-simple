export default (app, schema, data) => `
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title>Admin</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.7/sandstone/bootstrap.min.css">
    </head>
    <body>
        <div id="app">${app}</div>

        <script>window.__schema__=${JSON.stringify(schema)}</script>
        <script>window.__data__=${JSON.stringify(data)}</script>

        <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

        <script src="/bundle.js"></script>
    </body>
</html>
`;
