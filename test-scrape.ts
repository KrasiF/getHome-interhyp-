import { scrapeApi } from './game/apis/scrape-api';

async function testScrapeApi() {
    console.log('Testing scrape API...');
    console.log('Parameters: Munich, HOUSEBUY, 20 sqm');
    console.log('Expected range: 16-24 sqm (±20%)');
    console.log('---');

    try {
        const result = await scrapeApi({
            city: 'München',
            estateType: 'HOUSEBUY',
            squareMeters: 50
        });

        console.log(`Found ${result.results.length} listings:`);
        console.log('---');

        result.results.forEach((listing, index) => {
            console.log(`\n${index + 1}. ID: ${listing.id}`);
            console.log(`   Price: €${listing.buyingPrice.toLocaleString()}`);
            console.log(`   Size: ${listing.squareMeter} sqm`);
            console.log(`   Rooms: ${listing.rooms}`);
            console.log(`   ZIP: ${listing.zip}`);
            console.log(`   Image: ${listing.imageUrl ? 'Yes' : 'No'}`);
        });

        console.log('\n---');
        console.log('Test completed successfully!');
    } catch (error) {
        console.error('Error testing scrape API:', error);
        if (error instanceof Error) {
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
        }
    }
}

testScrapeApi();
