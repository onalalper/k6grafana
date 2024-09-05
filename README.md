
# K6 + Grafana Performance Testing with InfluxDB

This document explains how to set up and run performance tests using **K6**, **InfluxDB**, and **Grafana**. You will also learn why we use these tools and what each step does. The goal is to help you understand the workflow and provide answers to common questions.

## Why K6?

**K6** is a powerful, open-source tool for **load testing** and **performance testing**, especially for APIs and web applications. Here’s why we chose K6:

1. **JavaScript Support**: K6 test scenarios are written in JavaScript, allowing flexible and dynamic test creation.
2. **Ideal for Load Testing**: It simulates a large number of virtual users (VU) to test how your web applications perform under heavy load.
3. **CLI Integration**: K6 can be easily run from the command line and integrated into CI/CD pipelines.
4. **Rich Performance Data**: Collects important metrics like HTTP request durations and failure rates.

### K6 Installation and Test Script

After installing K6, you can write test scripts like the one below:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m30s', target: 20 },
    { duration: '20s', target: 0 },
  ],
};

export default function () {
  let res = http.get('https://test-api.k6.io/public/crocodiles/');
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
}
```

**What does this script do?**
- Sends a GET request to a test API.
- Checks if the response status is 200.
- Simulates different stages with a gradual increase to 20 users, holds that load, and then gradually decreases it.

## Why InfluxDB?

For performance testing, we need a database to store results for long-term analysis. **InfluxDB** is an ideal choice for storing time-series data, such as performance metrics, due to its:

1. **Time-Series Optimization**: Designed to efficiently store and query time-series data (e.g., request durations over time).
2. **K6 Integration**: K6 can directly output test results to InfluxDB, making it easier to store and analyze test data.
3. **Grafana Integration**: InfluxDB integrates seamlessly with Grafana, allowing for real-time visualization of test metrics.

### InfluxDB Setup

InfluxDB can be set up using Docker. Below is a `docker-compose.yml` file that also sets up Grafana:

```yaml
version: '3.1'

services:
  influxdb:
    image: influxdb:1.8
    ports:
      - "8086:8086"
    environment:
      INFLUXDB_DB: k6
      INFLUXDB_ADMIN_USER: admin
      INFLUXDB_ADMIN_PASSWORD: admin123

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin123
    depends_on:
      - influxdb
```

**What does this configuration do?**
- Starts InfluxDB on `localhost:8086` to store K6 test data.
- Creates the `k6` database and secures it with admin credentials.
- Starts Grafana on `localhost:3000`.

## Why Grafana?

**Grafana** is a powerful tool for visualizing metrics and analyzing performance over time. Instead of manually inspecting raw numbers, you can visualize trends and detect performance issues easily. Here’s why we chose Grafana:

1. **Flexible Dashboards**: Grafana lets you build custom dashboards to visualize time-series data, such as request latency over time.
2. **Multiple Data Sources**: It supports many data sources, including InfluxDB, making it highly adaptable.
3. **Alerting**: Grafana can trigger alerts when certain metrics exceed thresholds (e.g., high error rates).

### Grafana Setup

Once Grafana is up and running, you need to add InfluxDB as a data source:

1. Open your browser and go to [http://localhost:3000](http://localhost:3000).
2. Log in using the default credentials:
   - Username: `admin`
   - Password: `admin123`
3. Go to **Configuration** > **Data Sources**, and add InfluxDB with the following settings:
   - **URL**: `http://influxdb:8086`
   - **Database**: `k6`
   - **Username**: `admin`
   - **Password**: `admin123`

### Creating Grafana Dashboards

Once InfluxDB is connected, you can create panels in Grafana to visualize K6 metrics. Here are some common queries for different metrics:

#### HTTP Request Duration

```sql
SELECT mean("value") FROM "http_req_duration" WHERE $timeFilter GROUP BY time($__interval) fill(null)
```

#### HTTP Requests

```sql
SELECT sum("value") FROM "http_reqs" WHERE $timeFilter GROUP BY time($__interval) fill(null)
```

#### HTTP Failures

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

### Common K6 Metrics to Track

- **http_req_duration**: The total time for HTTP requests.
- **http_reqs**: The total number of HTTP requests made.
- **http_req_failed**: The ratio of failed HTTP requests.
- **http_req_blocked**: Time spent on DNS lookup and TCP connection.
- **http_req_connecting**: Time spent establishing the connection.
- **http_req_tls_handshaking**: Time spent during the TLS handshake.
- **http_req_sending**: Time spent sending the request.
- **http_req_waiting**: Time spent waiting for the server response.
- **http_req_receiving**: Time spent receiving the server response.
- **data_sent**: The total amount of data sent.
- **data_received**: The total amount of data received.
- **vus**: Number of active virtual users.
- **vus_max**: Maximum number of virtual users.

## Running the Project

### Step-by-Step Guide

1. **Clone the repository**:
   ```bash
   git clone https://github.com/onalalper/k6grafana.git
   cd k6grafana
   ```

2. **Start Docker containers**:
   ```bash
   docker-compose up -d
   ```

3. **Run the K6 test**:
   ```bash
   k6 run --out influxdb=http://influxdb:8086/k6 test.js
   ```

4. **View results in Grafana**: Go to [http://localhost:3000](http://localhost:3000) to visualize your performance metrics.

## Questions and Answers

### 1. **Why did we choose InfluxDB over other databases?**
InfluxDB is optimized for time-series data, which is exactly the type of data we collect in performance testing (e.g., how request durations change over time). It stores and retrieves this type of data efficiently.

### 2. **Why is K6 preferred over other performance testing tools?**
K6 provides a modern architecture, allowing tests to be written in JavaScript, which makes test scenarios more flexible. Additionally, its CLI integration makes it perfect for CI/CD workflows.

### 3. **Why do we visualize data in Grafana?**
Visualizing performance data in graphs helps you quickly identify patterns and anomalies. For instance, you can easily see when a bottleneck occurs and at what user load your system's performance starts to degrade.

## Cleaning Up

Once you are done testing, you can stop the containers using:

```bash
docker-compose down
```

This will stop and remove the InfluxDB and Grafana containers.

## Additional Resources

- [K6 Documentation](https://k6.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [InfluxDB Documentation](https://docs.influxdata.com/influxdb/)
