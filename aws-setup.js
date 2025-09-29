const AWS = require('aws-sdk');

// Configure AWS SDK
// Ensure environment variables are set before running this script
AWS.config.update({
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB();

/**
 * Creates the 'users' table in DynamoDB.
 */
const createUsersTable = async () => {
    const params = {
        TableName: 'users',
        KeySchema: [
            {
                AttributeName: 'email',
                KeyType: 'HASH' // Partition key
            }
        ],
        AttributeDefinitions: [
            {
                AttributeName: 'email',
                AttributeType: 'S'
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };

    try {
        await dynamodb.createTable(params).promise();
        console.log('✅ Users table created successfully.');
    } catch (error) {
        if (error.code === 'ResourceInUseException') {
            console.log('ℹ️ Users table already exists.');
        } else {
            console.error('❌ Error creating users table:', error);
            // Re-throw the error to stop the script if something critical fails
            throw error; 
        }
    }
};

/**
 * Creates the 'login-sessions' table with a Global Secondary Index.
 */
const createLoginSessionsTable = async () => {
    const params = {
        TableName: 'login-sessions',
        KeySchema: [
            {
                AttributeName: 'sessionId',
                KeyType: 'HASH' // Partition key
            }
        ],
        AttributeDefinitions: [
            {
                AttributeName: 'sessionId',
                AttributeType: 'S'
            },
            {
                AttributeName: 'email',
                AttributeType: 'S'
            }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'email-index',
                KeySchema: [
                    {
                        AttributeName: 'email',
                        KeyType: 'HASH'
                    }
                ],
                Projection: {
                    ProjectionType: 'ALL'
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };

    try {
        await dynamodb.createTable(params).promise();
        console.log('✅ Login sessions table created successfully.');
    } catch (error) {
        if (error.code === 'ResourceInUseException') {
            console.log('ℹ️ Login sessions table already exists.');
        } else {
            console.error('❌ Error creating login sessions table:', error);
            throw error; 
        }
    }
};

/**
 * Main function to create all required tables sequentially.
 */
const main = async () => {
    try {
        console.log('🚀 Starting DynamoDB table creation process...');
        await createUsersTable();
        await createLoginSessionsTable();
        console.log('🎉 Table creation process completed successfully.');
    } catch (err) {
        console.error('An error occurred during table creation. Exiting.');
        // Exit with an error code
        process.exit(1);
    }
};

// Execute the main function
main();
