import {
  mediana,
  mad,
  esAtipica,
  mediaMovil,
  pendienteLineal,
  epley,
} from './stats.utils';

describe('mediana', () => {
  it('retorna 0 para array vacío', () => {
    expect(mediana([])).toBe(0);
  });

  it('retorna el único elemento de un array de un elemento', () => {
    expect(mediana([42])).toBe(42);
  });

  it('retorna el valor central de un array de longitud impar', () => {
    expect(mediana([3, 1, 4, 1, 5])).toBe(3);
  });

  it('retorna el promedio de los dos valores centrales de un array de longitud par', () => {
    expect(mediana([1, 2, 3, 4])).toBe(2.5);
  });

  it('calcula la mediana correctamente en un array no ordenado', () => {
    expect(mediana([9, 2, 7, 1, 5])).toBe(5);
  });

  it('retorna el valor correcto cuando todos los elementos son iguales', () => {
    expect(mediana([7, 7, 7])).toBe(7);
  });
});

describe('mad', () => {
  it('retorna 0 para array vacío', () => {
    expect(mad([])).toBe(0);
  });

  it('retorna 0 cuando todos los valores son iguales', () => {
    expect(mad([5, 5, 5, 5])).toBe(0);
  });

  it('retorna un MAD pequeño ante un outlier extremo en un array homogéneo', () => {
    const resultado = mad([1, 1, 1, 1, 100]);
    expect(resultado).toBe(0);
  });

  it('calcula correctamente el MAD de una serie conocida', () => {
    expect(mad([1, 2, 3, 4, 5])).toBe(1);
  });
});

describe('esAtipica', () => {
  it('retorna false para un valor dentro del rango normal', () => {
    expect(esAtipica(3, [1, 2, 3, 4, 5])).toBe(false);
  });

  it('retorna true para un outlier claro con MAD > 0', () => {
    expect(esAtipica(100, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBe(true);
  });

  it('retorna false para el valor en la mediana exacta', () => {
    expect(esAtipica(3, [1, 2, 3, 4, 5])).toBe(false);
  });

  it('con MAD cero, retorna false para un valor igual a la mediana', () => {
    expect(esAtipica(1, [1, 1, 1, 1, 100])).toBe(false);
  });

  it('con array de dos elementos, retorna false para valor en la mediana', () => {
    expect(esAtipica(1.5, [1, 2])).toBe(false);
  });

  it('retorna false para extremo del rango que no supera 3 veces el MAD', () => {
    expect(esAtipica(5, [1, 2, 3, 4, 5])).toBe(false);
  });
});

describe('mediaMovil', () => {
  it('retorna array vacío para entrada vacía', () => {
    expect(mediaMovil([])).toEqual([]);
  });

  it('retorna el mismo elemento para array de un elemento', () => {
    expect(mediaMovil([10])).toEqual([10]);
  });

  it('los primeros puntos usan la ventana disponible cuando es menor que la ventana configurada', () => {
    const resultado = mediaMovil([10, 20, 30, 40, 50], 3);
    expect(resultado[0]).toBe(10);
    expect(resultado[1]).toBe(15);
    expect(resultado[2]).toBe(20);
  });

  it('aplica la ventana completa a partir del tercer elemento con ventana 3', () => {
    const resultado = mediaMovil([10, 20, 30, 40, 50], 3);
    expect(resultado[3]).toBe(30);
    expect(resultado[4]).toBe(40);
  });

  it('usa ventana por defecto de 3 cuando no se especifica ventana', () => {
    const conDefecto = mediaMovil([10, 20, 30, 40, 50]);
    const conExplicita = mediaMovil([10, 20, 30, 40, 50], 3);
    expect(conDefecto).toEqual(conExplicita);
  });

  it('con ventana 1 retorna el mismo array', () => {
    expect(mediaMovil([5, 10, 15], 1)).toEqual([5, 10, 15]);
  });

  it('devuelve array de la misma longitud que la entrada', () => {
    const entrada = [1, 2, 3, 4, 5, 6, 7];
    expect(mediaMovil(entrada, 3).length).toBe(entrada.length);
  });
});

describe('pendienteLineal', () => {
  it('retorna 0 para array de un solo elemento', () => {
    expect(pendienteLineal([99])).toBe(0);
  });

  it('retorna pendiente aproximadamente 1 para serie creciente perfecta', () => {
    expect(pendienteLineal([0, 1, 2, 3, 4])).toBeCloseTo(1, 10);
  });

  it('retorna pendiente aproximadamente -1 para serie decreciente perfecta', () => {
    expect(pendienteLineal([4, 3, 2, 1, 0])).toBeCloseTo(-1, 10);
  });

  it('retorna pendiente aproximadamente 0 para serie plana', () => {
    expect(pendienteLineal([5, 5, 5, 5, 5])).toBeCloseTo(0, 10);
  });

  it('retorna 0 para array vacío', () => {
    expect(pendienteLineal([])).toBe(0);
  });

  it('calcula pendiente positiva para serie con tendencia creciente con ruido', () => {
    const pendiente = pendienteLineal([1, 2, 4, 3, 5]);
    expect(pendiente).toBeGreaterThan(0);
  });
});

describe('epley', () => {
  it('devuelve el peso exacto cuando las repeticiones son 1', () => {
    expect(epley(100, 1)).toBe(100);
  });

  it('devuelve el peso exacto cuando se pasan 0 repeticiones con peso 0', () => {
    expect(epley(0, 1)).toBe(0);
  });

  it('calcula correctamente el 1RM estimado con 10 repeticiones a 100 kg', () => {
    expect(epley(100, 10)).toBeCloseTo(133.33, 2);
  });

  it('calcula correctamente el 1RM estimado con 5 repeticiones a 80 kg', () => {
    expect(epley(80, 5)).toBeCloseTo(93.33, 2);
  });

  it('a mayor número de repeticiones, mayor es el 1RM estimado para el mismo peso', () => {
    const con5 = epley(60, 5);
    const con10 = epley(60, 10);
    expect(con10).toBeGreaterThan(con5);
  });

  it('con 30 repeticiones el 1RM es el doble del peso levantado', () => {
    expect(epley(50, 30)).toBeCloseTo(100, 10);
  });
});
