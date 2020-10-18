# HAL-9000

An automation for the rest of us.

1. Install the dependencies:

    ```sh
    yarn install
    ```

1. Create your `.env` file, you can use `.env.example` as guidance.

1. Export your environment variables:

    ```sh
    export $(cat .env | xargs)
    ```

1. Run it:

    ```sh
    node allianz.js
    ```

    ```
    Allianz summary: {
      policyAmount: '$123,456.78',
    }
    ```

    ```sh
    node bbva.js
    ```

    ```
    BBVA summary: [
      { title: 'Cuenta de nómina • 01234', amount: '$234,567.89' },
      { title: 'Fondos de Inversión • 98765', amount: '$98,765.43' },
      { title: 'Pagaré • 54321', amount: '$5,432.10' }
    ]
    ```

    ```sh
    node cetesdirecto.js
    ```

    ```
    CetesDirecto summary: {
      instruments: [
        { name: 'BONDDIA', value: '123.45' },
        { name: 'CETES', value: '9,876.54' },
        { name: 'REMANENTES', value: '34.56' }
      ],
      instrumentsTotal: '12,345.98'
    }
    ```
