//import { format } from 'node:path';
import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  function handleProductIncrement(product: Product) {
    const { id, amount } = product;
    updateProductAmount({ productId: id, amount: (amount + 1)});
  }

  function handleProductDecrement(product: Product) {
    const { id, amount } = product;
    updateProductAmount({ productId: id, amount: (amount - 1)});
  }

  function handleRemoveProduct(productId: number) {
    // TODO
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>

        <tbody>
          {
            cart.map((product) => (
              <tr data-testid="product" key={ product.id }>
                <td>
                  <img src={ product.image } alt={ product.title } />
                </td>
                <td>
                  <strong>{ product.title }</strong>
                  <span>{ formatPrice(product.price ) }</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                      disabled={product.amount <= 1}
                      onClick={() => handleProductDecrement(product)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={ product.amount }
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                      onClick={() => handleProductIncrement(product)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{ formatPrice(product.amount * product.price )}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                    onClick={ () => removeProduct(product.id) }
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{
            formatPrice(cart.reduce((acc, cur) => ( acc + (cur.amount * cur.price) ), 0))
          }</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
