export class Libro {
  letto = false;

  constructor(titolo, autore, anno) {
    this.id = crypto.randomUUID();
    this.titolo = titolo;
    this.autore = autore;
    this.anno = anno;
  }

  segnaComeLetto() {
    this.letto = true;
  }

  formato() {
    return "cartaceo";
  }

  static fromJSON(d) {
    return Object.assign(new this(d.titolo, d.autore, d.anno), d);
  }
}

export class LibroDigitale extends Libro {
  constructor(titolo, autore, anno, dimensioneMb) {
    super(titolo, autore, anno);
    this.dimensioneMb = dimensioneMb;
  }

  formato() {
    return `digitale (${this.dimensioneMb} MB)`;
  }

  static fromJSON(d) {
    return Object.assign(
      new this(d.titolo, d.autore, d.anno, d.dimensioneMb),
      d,
    );
  }
}

export class LibroAudio extends Libro {
  constructor(titolo, autore, anno, durataMinuti) {
    super(titolo, autore, anno);
    this.durataMinuti = durataMinuti;
  }

  formato() {
    return `audio (${this.durataMinuti} min)`;
  }

  static fromJSON(d) {
    return Object.assign(
      new this(d.titolo, d.autore, d.anno, d.durataMinuti),
      d,
    );
  }
}
