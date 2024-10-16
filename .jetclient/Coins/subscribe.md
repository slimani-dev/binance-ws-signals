```toml
name = 'subscribe'
method = 'POST'
url = '{{BASE_URL}}/api/subscribe'
sortWeight = 1000000
id = '3f667a57-58de-49d6-a23c-73535cfa3218'

[body]
type = 'JSON'
raw = '''
{
  symbol: "{{symbol}}"
}'''
```

#### Pre-request Script

```js


```

#### Post-response Script

```js
jc.test('Status code is 200', () => {
    jc.expect(jc.response.code).to.eql(200)
})

jc.test('message contains coin name from env', () => {
    const symbol = jc.collectionVariables.get('symbol')
    jc.expect(jc.response.text()).to.contain(`${symbol.toLowerCase()}usdt@trade`)
})




```
