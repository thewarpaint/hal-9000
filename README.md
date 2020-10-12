# HAL-9000

An automation for the rest of us.

1. Install the dependencies:

    ```
    yarn install
    ```

1. Create your `.env` file, you can use `.env.example` as guidance.

1. Run it:

    ```
    export $(cat .env | xargs)
    node cetesdirecto.js
    ```

    You should get something like this:

    ```
    Portfolio summary: {
      instruments: [
        { name: 'BONDDIA', value: '123.45' },
        { name: 'CETES', value: '9,876.54' },
        { name: 'REMANENTES', value: '34.56' }
      ],
      instrumentsTotal: '12,345.98'
    }
    ```
