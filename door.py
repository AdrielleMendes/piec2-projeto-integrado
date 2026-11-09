from __future__ import annotations

import asyncio

import httpx

from . import config


async def unlock_door(*, liveness_verified: bool) -> tuple[bool, str]:
    """Aciona a fechadura após identidade, PIN e confirmação do dispositivo de presença."""
    if not config.PHYSICAL_UNLOCK_ENABLED:
        return False, "simulação: acionamento físico desativado"
    if not liveness_verified:
        return False, "presença ao vivo não confirmada pelo dispositivo confiável; porta mantida trancada"

    if config.DOOR_RELAY_MODE == "http":
        if not config.DOOR_RELAY_URL or not config.DOOR_RELAY_TOKEN:
            return False, "controlador HTTP não configurado"
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                response = await client.post(
                    config.DOOR_RELAY_URL.rstrip("/") + "/unlock",
                    json={"pulse_ms": max(200, min(config.DOOR_RELAY_PULSE_MS, 5000))},
                    headers={"X-Device-Token": config.DOOR_RELAY_TOKEN},
                )
                response.raise_for_status()
                data = response.json() if response.content else {}
                if data.get("unlocked") is not True:
                    return False, "controlador não confirmou a abertura"
                return True, "fechadura acionada pelo controlador"
        except (httpx.HTTPError, ValueError):
            return False, "falha de comunicação com o controlador da fechadura"

    if config.DOOR_RELAY_MODE == "gpio":
        try:
            from gpiozero import OutputDevice

            def pulse() -> None:
                relay = OutputDevice(
                    config.DOOR_GPIO_PIN,
                    active_high=config.DOOR_GPIO_ACTIVE_HIGH,
                    initial_value=False,
                )
                try:
                    relay.on()
                    import time
                    time.sleep(max(0.2, min(config.DOOR_RELAY_PULSE_MS / 1000, 5.0)))
                finally:
                    relay.off()
                    relay.close()

            await asyncio.to_thread(pulse)
            return True, "relé GPIO acionado"
        except Exception:
            return False, "falha ao acionar o relé GPIO"

    return False, "modo de relé desconhecido ou desativado"
