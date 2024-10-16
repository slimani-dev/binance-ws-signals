```toml
name = 'binance-ws-signals Test Suite'
sortWeight = 2000000
id = 'a554100c-1bc5-4fbd-9302-479384aa61f2'
```

#### Script

```js
response = await jc.runRequest('/api/subscribe')

await jc.runRequest('/api/unsubscribe')


```
