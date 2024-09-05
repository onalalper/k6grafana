import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 500 }, // 0-30 saniye arasında 20 kullanıcıya kadar yük arttır.
    { duration: '1m30s', target: 500 }, // 1 dakika 30 saniye boyunca 20 kullanıcıyı sabit tut.
    { duration: '20s', target: 0 }, // 20 saniye içinde kullanıcı sayısını sıfıra düşür.
  ],
};

export default function () {
  let res = http.get('https://aryuder.api.useinsider.com/health');
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
}
