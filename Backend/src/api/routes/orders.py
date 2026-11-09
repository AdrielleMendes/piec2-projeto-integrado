from fastapi import APIRouter, HTTPException, status
from src.api.routes.devices import DEVICES_CATALOG
from src.schemas.schema import OrderCreate, OrderResponse

router = APIRouter(
    prefix="/api/v1/orders",
    tags=["Orders"]
)

# Armazenamento em memória (substituir por persistência no banco de dados futuramente)
ORDERS_DB: list[OrderResponse] = []
_next_order_id = 1


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order_in: OrderCreate):
    """
    Endpoint para criar um novo pedido de adesão de dispositivos.
    Valida os itens contra o catálogo, calcula os totais e registra o pedido.
    """
    global _next_order_id

    catalog_by_id = {device.id: device for device in DEVICES_CATALOG}

    monthly_total = 0.0
    installation_total = 0.0

    for item in order_in.items:
        device = catalog_by_id.get(item.device_id)
        if device is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Dispositivo com id {item.device_id} não encontrado no catálogo.",
            )
        monthly_total += device.monthly_price * item.quantity
        installation_total += device.installation_price * item.quantity

    order = OrderResponse(
        id=_next_order_id,
        customer_name=order_in.customer_name,
        customer_email=order_in.customer_email,
        status="Recebido",
        monthly_total=round(monthly_total, 2),
        installation_total=round(installation_total, 2),
    )

    ORDERS_DB.append(order)
    _next_order_id += 1

    return order
