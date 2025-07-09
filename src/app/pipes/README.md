# Price Pipe

The `PricePipe` is a custom Angular pipe designed to format prices according to the application's currency settings.

## Usage

The pipe can be used in templates to format numeric price values:

```html
<!-- With currency symbol (default) -->
{{ price | price }}

<!-- Without currency symbol -->
{{ price | price:false }}
```

## Implementation

The pipe leverages the `PriceUtil` utility class, which reads the currency configuration from the environment settings.

### Benefits

1. **Consistency**: All price formatting follows the same pattern throughout the application
2. **Maintainability**: Changes to price formatting logic only need to be made in one place
3. **Readability**: Templates are cleaner and more declarative
4. **Type Safety**: The pipe handles null and undefined values gracefully

## Examples

```html
<!-- Formatted with currency symbol: 10,000 ₫ -->
<div>{{ 10000 | price }}</div>

<!-- Formatted without currency symbol: 10,000 -->
<div>{{ 10000 | price:false }}</div>

<!-- Safe handling of null values -->
<div>{{ nullVariable | price }}</div>
```
