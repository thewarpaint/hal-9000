# HAL-9000

An automation for the rest of us.

## What?

A collection of "automations" to retrieve information from services without a public API.
Think of a poor man's open source [Belvo](https://belvo.com/).

## Why?

A bunch of services we use could really benefit from having a public API.
The easiest way to do that is through UI automation.

## How?

1. Install the dependencies:

    ```sh
    yarn install
    ```

1. Create your `.env` file, you can use `.env.example` as guidance.

1. Export your environment variables:

    ```sh
    export $(cat .env | xargs)
    ```

1. Now you're able to run the service automations:

### [Allianz](https://www.allianz.com.mx/)

```sh
node allianz-example.js
```

```
Allianz summary: {
  policyAmount: '123456.78',
}
```

### [BBVA](https://www.bbva.mx/)

```sh
node bbva-example.js
```

```
BBVA summary: [
  { title: 'Cuenta de nómina • 01234', amount: '234567.89' },
  { title: 'Fondos de Inversión • 98765', amount: '98765.43' },
  { title: 'Pagaré • 54321', amount: '$5432.10' }
]
```

### [cetesdirecto](https://www.cetesdirecto.com/)

```sh
node cetesdirecto-example.js
```

```
CetesDirecto summary: {
  instruments: [
    { name: 'BONDDIA', value: '123.45' },
    { name: 'CETES', value: '9876.54' },
    { name: 'REMANENTES', value: '34.56' }
  ],
  instrumentsTotal: '12345.98'
}
```

### [Infonavit](https://micuenta.infonavit.org.mx/)

```sh
node infonavit-example.js
```

```
Infonavit summary: {
  savings: [
    { type: 'Subcuenta de Vivienda 1997', amount: '1234567.98' },
    { type: 'Subcuenta de Vivienda SAR 1992', amount: '0.00' },
    { type: 'Fondo de ahorro 1972', amount: '0.00' }
  ]
}
```

### [N26](https://n26.com/)

```sh
node n26-example.js
```

```
N26 summary: { balance: '9876.54' }
```
