
# K6 + Grafana Performance Testing Setup

This project demonstrates how to set up and run performance tests using **K6**, **InfluxDB**, and **Grafana**. You'll be able to run load tests using K6, store the results in InfluxDB, and visualize the performance metrics in Grafana.

## Prerequisites

Before getting started, make sure you have the following installed on your machine:

- **Docker**: To run InfluxDB and Grafana containers.
- **K6**: To run the performance tests.

## Setup Instructions

Follow these steps to set up the project and run the tests.

### Step 1: Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/onalalper/k6grafana.git
cd k6grafana
```

### Step 2: Start Docker Containers

Use Docker Compose to start the necessary services (InfluxDB and Grafana):

```bash
docker-compose up -d
```

This will start InfluxDB on `http://localhost:8086` and Grafana on `http://localhost:3000`.

### Step 3: Run K6 Test

To run the K6 performance test and send the results to InfluxDB, use the following command:

```bash
k6 run --out influxdb=http://influxdb:8086/k6 test.js
```

### Step 4: Access Grafana

Once the test is running, you can visualize the results in Grafana:

1. Open your browser and go to [http://localhost:3000](http://localhost:3000).
2. Login using the default credentials:
   - Username: `admin`
   - Password: `admin123`
3. Add InfluxDB as a data source:
   - Go to **Configuration** > **Data Sources**.
   - Add a new data source, select **InfluxDB**.
   - Set the following parameters:
     - **URL**: `http://influxdb:8086`
     - **Database**: `k6`
     - **Username**: `admin`
     - **Password**: `admin123`
   - Click **Save & Test**.

### Step 5: Create Grafana Dashboard

To visualize the test results, create a new Grafana dashboard:

1. Go to **Create** > **Dashboard**.
2. Add a new panel.
3. Use the following queries for different metrics:

#### HTTP Request Duration

```sql
SELECT mean("value") FROM "http_req_duration" WHERE $timeFilter GROUP BY time($__interval) fill(null)
```

#### HTTP Requests

```sql
SELECT sum("value") FROM "http_reqs" WHERE $timeFilter GROUP BY time($__interval) fill(null)
```

#### HTTP Request Failures

```sql
SELECT mean("value") FROM "http_req_failed" WHERE $timeFilter GROUP BY time($__interval) fill(null)
```

#### Data Sent

```sql
SELECT sum("value") FROM "data_sent" WHERE $timeFilter GROUP BY time($__interval) fill(null)
```

#### Data Received

```sql
SELECT sum("value") FROM "data_received" WHERE $timeFilter GROUP BY time($__interval) fill(null)
```

#### Virtual Users (VUs)

```sql
SELECT last("value") FROM "vus" WHERE $timeFilter GROUP BY time($__interval) fill(null)
```

Once you've added the queries, click **Apply** to save the panel, and repeat the process to add more panels for other metrics.

## Available K6 Metrics

Here are the common K6 metrics you can visualize in Grafana:

- **http_req_duration**: The total time taken for HTTP requests.
- **http_reqs**: The total number of HTTP requests.
- **http_req_failed**: The ratio of failed HTTP requests.
- **http_req_blocked**: Time spent in DNS lookup, connection, etc.
- **http_req_connecting**: Time spent connecting to the server.
- **http_req_tls_handshaking**: Time spent on TLS handshake.
- **http_req_sending**: Time spent sending the request.
- **http_req_waiting**: Time spent waiting for the server response.
- **http_req_receiving**: Time spent receiving the response.
- **data_sent**: Total amount of data sent.
- **data_received**: Total amount of data received.
- **vus**: Number of active Virtual Users (VUs).
- **vus_max**: Maximum number of VUs.

## Cleaning Up

When you're done with testing, stop the containers by running:

```bash
docker-compose down
```

This will stop and remove the containers for InfluxDB and Grafana.

## Additional Resources

- [K6 Documentation](https://k6.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [InfluxDB Documentation](https://docs.influxdata.com/influxdb/)
