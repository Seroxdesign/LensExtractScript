const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { Alchemy, Network, NftFilters } = require("alchemy-sdk");

const config = {
  apiKey: "",
  network: Network.MATIC_MAINNET,
};
const alchemy = new Alchemy(config);
let counter = 0
const csvFilePath = './file.csv'; // Replace with your file path
const outputCsvFilePath = 'output.csv';

const csvWriter = createCsvWriter({
  path: outputCsvFilePath,
  header: [
    { id: 'address', title: 'address' },
    { id: 'lensName', title: 'lensName' },
    { id: 'lensId', title: 'lensId' },
  ],
});

const extractedData = [];

const processCSV = async () => {
  try {
    const dataStream = fs.createReadStream(csvFilePath);

    for await (const row of dataStream.pipe(csv({ headers: true }))) {
      // console.log(row), then you can see the data and extract it based on console name
      // example: row = { _1: 'value1', _2: 'value2', _3: 'value3', _4: 'value4' }
      // then choose the key for the value you want to extract, either ens or ethereum address
      const column1Value = row._4; // Update to your column name
      counter = counter+1
      if (column1Value) {
        try {

          const nfts = await alchemy.nft.getNftsForOwner(column1Value, { excludeFilters: [NftFilters.SPAM] });
          const lens = nfts.ownedNfts.find((nft) => nft.contract.address === '0xdb46d1dc155634fbc732f92e853b10b288ad5a1d');
          console.log(column1Value, lens, counter)
          if (lens) {
            extractedData.push({ address: column1Value, lensName: lens.title, lensId: lens.tokenId });
          }
        }
        catch {
          console.log('invalid')
        }
        
      }
    }

    await csvWriter.writeRecords(extractedData);
    console.log('CSV file has been written successfully.');
  } catch (error) {
    console.log(extractedData)
    await csvWriter.writeRecords(extractedData);
    console.error('Error:', error);
  }
};

processCSV();

console.log('Reading CSV file...'); // This will be executed immediately, but the data extraction is asynchronous
