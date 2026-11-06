
export const productos = [
  {
    id: "manzana",
    nombre: "Manzana",
    precio: 5,
    comida: 15,
    felicidad: 0,
  },
  {
    id: "pescado",
    nombre: "Pescado",
    precio: 10,
    comida: 30,
    felicidad: 0,
  },
  {
    id: "pastel",
    nombre: "Pastel",
    precio: 15,
    comida: 40,
    felicidad: 10,
  },
];

export function crearMascota(nombre) {
  return {
    nombre: nombre,
    comida: 80,
    felicidad: 80,
    energia: 80,
    monedas: 50,
    inventario: {
      manzana: 0,
      pescado: 0,
      pastel: 0,
    },
    ultimaActualizacion: Date.now(),
  };
}

export function actualizarMascota(mascota) {
  const ahora = Date.now();
  const ultima = mascota.ultimaActualizacion || ahora;

  const minutos = Math.max(
    0,
    Math.floor((ahora - ultima) / 60000)
  );

  if (minutos === 0) {
    return mascota;
  }

  return {
    ...mascota,
    comida: Math.max(0, mascota.comida - minutos),
    felicidad: Math.max(0, mascota.felicidad - minutos),
    energia: Math.max(0, mascota.energia - minutos),
    ultimaActualizacion: ultima + minutos * 60000,
  };
}

export function alimentar(mascota) {
  if (mascota.monedas < 5) {
    return mascota;
  }

  return {
    ...mascota,
    comida: Math.min(100, mascota.comida + 20),
    monedas: mascota.monedas - 5,
  };
}

export function jugar(mascota) {
  if (mascota.energia < 15) {
    return mascota;
  }

  return {
    ...mascota,
    felicidad: Math.min(100, mascota.felicidad + 20),
    energia: mascota.energia - 15,
    monedas: mascota.monedas + 10,
  };
}

export function dormir(mascota) {
  return {
    ...mascota,
    energia: Math.min(100, mascota.energia + 30),
  };
}

export function comprarProducto(mascota, producto) {
  if (mascota.monedas < producto.precio) {
    return mascota;
  }

  const inventario = mascota.inventario || {};

  return {
    ...mascota,
    monedas: mascota.monedas - producto.precio,
    inventario: {
      ...inventario,
      [producto.id]: (inventario[producto.id] || 0) + 1,
    },
  };
}

export function usarProducto(mascota, producto) {
  const inventario = mascota.inventario || {};

  if (!inventario[producto.id]) {
    return mascota;
  }

  return {
    ...mascota,
    comida: Math.min(100, mascota.comida + producto.comida),
    felicidad: Math.min(
      100,
      mascota.felicidad + producto.felicidad
    ),
    inventario: {
      ...inventario,
      [producto.id]: inventario[producto.id] - 1,
    },
  };
}
