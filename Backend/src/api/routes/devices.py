from fastapi import APIRouter
from src.schemas.schema import DeviceOut

router = APIRouter(
    prefix="/api/v1/devices",
    tags=["Devices"]
)

# Catálogo em memória (substituir por consulta ao banco de dados futuramente)
DEVICES_CATALOG = [
    DeviceOut(
        id=1,
        name="Câmera Inteligente NX-Cam 4K",
        description="Câmera externa 4K com visão noturna colorida, detecção de pessoas e resistência IP66.",
        category="camera",
        monthly_price=49.90,
        installation_price=199.00,
    ),
    DeviceOut(
        id=2,
        name="Câmera Dome Interna 360°",
        description="Cobertura panorâmica interna com rastreamento de movimento e áudio bidirecional.",
        category="camera",
        monthly_price=39.90,
        installation_price=149.00,
    ),
    DeviceOut(
        id=3,
        name="Sensor de Movimento NX-Motion",
        description="Sensor infravermelho com imunidade a pets e alertas instantâneos no aplicativo.",
        category="sensor",
        monthly_price=19.90,
        installation_price=79.00,
    ),
    DeviceOut(
        id=4,
        name="Sensor de Abertura Porta/Janela",
        description="Sensor magnético discreto que detecta aberturas não autorizadas em portas e janelas.",
        category="sensor",
        monthly_price=14.90,
        installation_price=59.00,
    ),
    DeviceOut(
        id=5,
        name="Fechadura Inteligente NX-Lock",
        description="Fechadura biométrica com senhas temporárias, histórico de acessos e trava automática.",
        category="fechadura",
        monthly_price=59.90,
        installation_price=249.00,
    ),
    DeviceOut(
        id=6,
        name="Central de Alarme NX-Hub",
        description="Hub central com bateria reserva, conectividade 4G redundante e automações locais.",
        category="central",
        monthly_price=69.90,
        installation_price=299.00,
    ),
    DeviceOut(
        id=7,
        name="Detector de Fumaça e Gás",
        description="Detecção precoce de fumaça, monóxido de carbono e vazamento de gás com sirene integrada.",
        category="sensor",
        monthly_price=17.90,
        installation_price=89.00,
    ),
    DeviceOut(
        id=8,
        name="Sirene Externa NX-Siren",
        description="Sirene de alta potência com luz estroboscópica e acionamento automático em invasões.",
        category="alarme",
        monthly_price=24.90,
        installation_price=99.00,
    ),
]


@router.get("/", response_model=list[DeviceOut])
async def list_devices():
    """
    Retorna o catálogo de dispositivos disponíveis para adesão.
    """
    return DEVICES_CATALOG
