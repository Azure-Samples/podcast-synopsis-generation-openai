
import azure.functions as func
from .rest_api import app

def main(req: func.HttpRequest, context: func.Context) -> func.HttpResponse:
    """Each request is redirected to the WSGI handler.
    """
    # see https://learn.microsoft.com/en-us/samples/azure-samples/flask-app-on-azure-functions/azure-functions-python-create-flask-app/
    return func.WsgiMiddleware(app.wsgi_app).handle(req, context)

