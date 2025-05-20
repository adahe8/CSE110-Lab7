describe("Basic user flow for Website", () => {
  // First, visit the lab 7 website
  beforeAll(async () => {
    await page.goto("https://cse110-sp25.github.io/CSE110-Shop/");
  });

  // Each it() call is a separate test
  // Here, we check to make sure that all 20 <product-item> elements have loaded
  it("Initial Home Page - Check for 20 product items", async () => {
    console.log("Checking for 20 product items...");

    // Query select all of the <product-item> elements and return the length of that array
    const numProducts = await page.$$eval("product-item", (prodItems) => {
      return prodItems.length;
    });

    // Expect there that array from earlier to be of length 20, meaning 20 <product-item> elements where found
    expect(numProducts).toBe(20);
  });

  // Check to make sure that all 20 <product-item> elements have data in them
  // We use .skip() here because this test has a TODO that has not been completed yet.
  // Make sure to remove the .skip after you finish the TODO.
  it("Make sure <product-item> elements are populated", async () => {
    console.log(
      "Checking to make sure <product-item> elements are populated..."
    );

    // Start as true, if any don't have data, swap to false
    let allArePopulated = true;

    // Query select all of the <product-item> elements
    const prodItemsData = await page.$$eval("product-item", (prodItems) => {
      return prodItems.map((item) => {
        // Grab all of the json data stored inside
        return (data = item.data);
      });
    });

    console.log(`Checking product item 1/${prodItemsData.length}`);

    // Make sure the title, price, and image are populated in the JSON
    prodItemsData.forEach((value) => {
      if (value.title.length == 0) {
        allArePopulated = false;
      }
      if (value.price.length == 0) {
        allArePopulated = false;
      }
      if (value.image.length == 0) {
        allArePopulated = false;
      }
    });

    // Expect allArePopulated to still be true
    expect(allArePopulated).toBe(true);
  }, 10000);

  // Check to make sure that when you click "Add to Cart" on the first <product-item> that
  // the button swaps to "Remove from Cart"
  it('Clicking the "Add to Cart" button should change button text', async () => {
    console.log('Checking the "Add to Cart" button...');

    const productHandle = await page.$("product-item");
    const shadowHandle = await productHandle.evaluateHandle(
      (e) => e.shadowRoot
    );
    const buttonHandle = await shadowHandle.$("button");
    await buttonHandle.click();

    const newValue = await buttonHandle.evaluate((button) => button.innerText);

    //expect innerText to be "Remove from cart"
    expect(newValue).toBe("Remove from Cart");
    //remove item from cart again to reset for next test
    await buttonHandle.click();
  }, 2500);

  // Check to make sure that after clicking "Add to Cart" on every <product-item> that the Cart
  // number in the top right has been correctly updated
  it("Checking number of items in cart on screen", async () => {
    console.log("Checking number of items in cart on screen...");

    const allProducts = await page.$$("product-item");
    for (const product of allProducts) {
      const shadowHandle = await product.evaluateHandle((e) => e.shadowRoot);
      const buttonHandle = await shadowHandle.$("button");
      await buttonHandle.click();
    }

    const cartHandle = await page.$("#cart-count");
    const cartCount = await cartHandle.evaluate((cc) => cc.innerText);

    //expect cart count to be 20
    expect(cartCount).toBe("20");
  }, 10000);

  // Check to make sure that after you reload the page it remembers all of the items in your cart
  it("Checking number of items in cart on screen after reload", async () => {
    console.log("Checking number of items in cart on screen after reload...");

    await page.reload();

    const allProducts = await page.$$("product-item");
    const buttonInfo = await Promise.all(
      allProducts.map(async (product) => {
        const shadowHandle = await product.evaluateHandle((e) => e.shadowRoot);
        const buttonHandle = await shadowHandle.$("button");
        const buttonText = await buttonHandle.evaluate(
          (button) => button.innerText
        );
        return buttonText === "Remove from Cart";
      })
    );

    const preserved = buttonInfo.every((val) => val);

    const cartCount = await page.$eval("#cart-count", (e) => e.innerText);

    expect(preserved && cartCount === "20").toBe(true);
  }, 10000);

  // Check to make sure that the cart in localStorage is what you expect
  it("Checking the localStorage to make sure cart is correct", async () => {
    const cartValue = await page.evaluate(() => {
      return localStorage.getItem("cart");
    });
    expect(cartValue).toBe(
      "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]"
    );
  });

  // Checking to make sure that if you remove all of the items from the cart that the cart
  // number in the top right of the screen is 0
  it("Checking number of items in cart on screen after removing from cart", async () => {
    console.log("Checking number of items in cart on screen...");

    const allProducts = await page.$$("product-item");
    for (const product of allProducts) {
      const shadowHandle = await product.evaluateHandle((e) => e.shadowRoot);
      const buttonHandle = await shadowHandle.$("button");
      await buttonHandle.click();
    }
    const cartCount = await page.$eval("#cart-count", (e) => e.innerText);
    expect(cartCount).toBe("0");
  }, 10000);

  // Checking to make sure that it remembers us removing everything from the cart
  // after we refresh the page
  it("Checking number of items in cart on screen after reload", async () => {
    console.log("Checking number of items in cart on screen after reload...");

    await page.reload();

    const allProducts = await page.$$("product-item");
    const buttonInfo = await Promise.all(
      allProducts.map(async (product) => {
        const shadowHandle = await product.evaluateHandle((e) => e.shadowRoot);
        const buttonHandle = await shadowHandle.$("button");
        const buttonText = await buttonHandle.evaluate(
          (button) => button.innerText
        );
        return buttonText === "Add to Cart";
      })
    );

    const preserved = buttonInfo.every((val) => val);

    const cartCount = await page.$eval("#cart-count", (e) => e.innerText);

    expect(preserved && cartCount === "0").toBe(true);
  }, 10000);

  // Checking to make sure that localStorage for the cart is as we'd expect for the
  // cart being empty
  it("Checking the localStorage to make sure cart is correct", async () => {
    console.log("Checking the localStorage...");

    const cart = await page.evaluate(() => {
      return JSON.stringify(JSON.parse(localStorage.getItem("cart")));
    });
    expect(cart).toBe("[]");
  });
});
