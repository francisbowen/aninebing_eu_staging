// Code retrieved from: https://gist.github.com/RangaPrakashs/94d194b843968f72c9002a7306e0a457 with modifications

(() => {
  if (theme.template.suffix == 'shared-wishlist') {
    const add = theme.locales.customer.wishlist.add;
    const empty = theme.locales.customer.wishlist.empty;
    const continueShopping = theme.locales.customer.wishlist.continue_shopping;
    const adding = theme.locales.customer.wishlist.adding;
    const wishlistContentsContainer = document.getElementById('wishlist-items-container');
    const wishlistLoading = theme.locales.customer.wishlist.loading;

    // Tile mark up
    const productCardMarkup = `
      <ul class="cart__items">
        {{#products}}
          <li class="cart__item js-cart-item">
            <a class="cart__item-image" href="{{du}}" aria-label="Link to {{title}}">
              <img class="grid-view-item__image lazyautosizes" src="{{iu}}" alt="{{title}}" />
            </a>
            <div class="cart__item-details">
              <p class="cart__item-title uppercase-text js-cart-item-title">
                {{#colorAssociated}}{{genericTitle}}<br><span class="text-title-space">{{ color }}</span>{{/colorAssociated}}
                {{^colorAssociated}}{{title}}{{/colorAssociated}}
              </p>
              <p class="cart__item-price-container price" data-price="">
                <span class="cart__item-price cart__item-price--final small-text js-cart-item-price">
                  {{cu}}{{pr}}
                </span>
              </p>
              <div>
                <div class="cart__item-options-container">
                  <button class="cart__item-option-single-variant cart__item-option-selected dropdown__trigger js-selected-option" aria-label="Variant selector" aria-expanded="false" data-variant-price="{{pr}}" data-variant-id="{{id}}" data-inventory="{{inventory_quantiy}}" data-toggle="{&quot;target&quot;:&quot;js-dropdown-container--{{epi}}--cart-flyout&quot;,&quot;group&quot;:&quot;js-dropdown-container&quot;, &quot;focusTarget&quot;: &quot;js-dropdown-container&quot;, &quot;closeOnUnfocus&quot;: true}">
                    <span class="small-text">{{vval1}}</span>
                  </button>
                  {{#allVariants}}
                    {{#.}}
                      <div id="js-dropdown-container--{{epi}}--cart-flyout" class="cart__item-dropdown dropdown__list js-dropdown-container" style="height: 0px;" aria-hidden="true">
                        <button tabindex="-1"  aria-label="{{title}}" class="cart__item-option js-cart-item-option small-text" 
                          data-product-id="{{empi}}" 
                          data-image="{{iu}}" 
                          data-price="{{pr}}"
                          data-variant-price="{{pr}}" 
                          data-variant-id="{{id}}" 
                          data-inventory="{{inventory_quantity}}"
                          data-oversell="">{{title}}</button>
                      </div>
                    {{/.}}
                  {{/allVariants}}
                </div>
              </div>
              {{#comingSoon}}
                <a class="cart__item-out-of-stock cart__item-add link link--primary js-out-of-stock-trigger is-coming-soon" data-modal-target="#coming-soon-modal" name="modal" role="button" aria-label="button" data-price="{{pr}}" data-variant-id="{{epi}}" data-id="{{empi}}" data-image="{{iu}}" data-variant-info="{{vval1}}" data-title="{{title}}" data-atc-text="${theme.locales.cart.coming_soon}">${theme.locales.cart.coming_soon}</a>
              {{/comingSoon}}
              {{^comingSoon}}
                {{^isOOS}}
                  <a class="cart__item-add heading--3 js-add-to-cart" href="" data-product-id="{{empi}}" data-url="{{du}}" data-variant-id="{{epi}}" aria-label="Add {{title}} to Cart" data-atc-text="${add}">
                    ${add}
                  </a>
                {{/isOOS}}
                {{#isOOS}}
                  <a class="cart__item-out-of-stock cart__item-add link link--primary js-out-of-stock-trigger is-oos" data-modal-target="#my-signup-modal" name="modal" role="button" aria-label="button" data-price="{{pr}}" data-variant-id="{{epi}}" data-id="{{empi}}" data-image="{{iu}}" data-variant-info="{{vval1}}" data-title="{{title}}" data-atc-text="${theme.locales.cart.out_of_stock}">${theme.locales.cart.out_of_stock}</a>
                  <p class="cart__item-error-message small-text js-cart-error-message"></p>
                {{/isOOS}}
              {{/comingSoon}}
            </div>
          </li>
        {{/products}}
      </ul>
    `;

    const productEmptyCardMarkup = `
      <div class="cart__empty is-visible">
        <p class="cart__empty-body">${empty}</p>
        <a class="cart__empty-link link link--primary" href="/" title="${continueShopping}" aria-label="${continueShopping}">${continueShopping}</a>
      </div>
    `;

    const productLoadingCardMarkup = `
      <div class="cart__empty is-visible">
        <p class="cart__empty-body">${wishlistLoading}</p>
      </div>
    `;
    
    // Fetch Products based on who shared.
    function fetchSharedWishlistProducts(){
      //   Get the Hkey
      var userHkey = SwymUtils.getParameterByName("hkey");
      if(userHkey.trim() !== ""){
        _swat.sharedWlApi.fetch({
          params: {hkey: userHkey},
          scb: function(res) {
            renderWishlistUI(res.queryres, _swat);
          },
          fcb: function() {
            SwymUtils.error("Error fetching shared wishlisted Products", arguments);
            errorCallback(null);
          }
        });
      }
    }

    var __wishlistedProducts = [];

    // Render the Products in the User Interface.
    function renderWishlistUI(products, swat){
      //re-route default url.
      SwymUtils.getHostedURL = function() {
        return "/pages/shared-wishlist?";
      }

      //fetch the container.
      var wishlistContentsContainer = document.getElementById("wishlist-items-container");

      // format products if required
      if (products.length > 0) {
        __wishlistedProducts = products;
        console.time("Initial Wishlist Fetched and Rendered");
        render(swat, products, false);
        attachClickListeners(false); // false skips notify me events.
        updateOOSProducts(swat, products);
        console.timeEnd("Initial Wishlist Fetched and Rendered");
      } else {
        wishlistContentsContainer.innerHTML = productEmptyCardMarkup;
      }
    };

    function render(swat, products, isNotifyBtn) {
      var wishlistContentsContainer = document.getElementById("wishlist-items-container");
      if (wishlistContentsContainer) {
        var formattedWishlistedProducts = products.map(function(p) {
          p = SwymUtils.formatProductPrice(p); // formats product price and adds currency to product Object

          /**
           * Start Custom Code Addition
           * */

          const genericTitle = p.title.split('- ');
          p.colorAssociated = false;
          
          // Title generation
          if (genericTitle.length > 1) {
            p.genericTitle = genericTitle[0];
            p.color = genericTitle[1];
            p.colorAssociated = true;
          }

          p.remove = theme.svgs.remove;

          /**
           * End Custom Code Addition
           * */ 

          p.isInCart = swat.platform.isInDeviceCart(p.epi) || (p.et == swat.EventTypes.addToCart);
          p.variantinfo = (p.variants ? getVariantInfo(p.variants) : "");
          return p;
        });
        var productCardsMarkup = SwymUtils.renderTemplateString(productCardMarkup, {
          products: formattedWishlistedProducts
        });
        wishlistContentsContainer.innerHTML = productCardsMarkup;
      }
    }

    if(!window.SwymCallbacks){
      window.SwymCallbacks = [];
    }

    window.SwymCallbacks.push(fetchSharedWishlistProducts);

    function updateOOSProducts(swat, products) {
      fetchCompleteProductMeta(swat, products, function(updatedProducts) {
        console.time("Second Render Update OOS Products");
        render(swat, updatedProducts);
        attachClickListeners(true);
        console.timeEnd("Second Render Update OOS Products");
      });
    }

    function fetchCompleteProductMeta(swat, products, callback) {
      //fetch and update avalabile variants.  
      products.forEach(function(product, index) {
        console.time("Fetching Complete Details for Each Product Begin GetProductDetails");
        var params = {
          epi: product.epi,
          empi: product.empi,
          du: product.du
        };
        swat.getProductDetails(params, function(productJSON) {
          products.forEach(function(p) {
            // console.log("Updated! Product for OOS")
            if (p.empi == productJSON.id) {
              // Product Tags - Check for Coming Soon
              p.comingSoon = productJSON.tags.includes('swym-comingsoon') ? true : false;

              if (p.comingSoon) callback(products); //update the product that was just recieved.
              
              //get variant availablity
              productJSON.variants.forEach(function(variant) {
                if (p.epi == variant.id && !variant.available) {
                  p.isOOS = !variant.available; // add your OOS variant logic here.
                  callback(products); //update the product that was just recieved.
                  // console.timeEnd("Updated! Product for OOS");
                }
              });
            }
          });
        });
        console.timeEnd("Fetching Complete Details for Each Product Begin GetProductDetails");
      });
    }

    const isSelectedItemInCart = (variantId) => {
      const variantIdAlreadyInCart = theme.cart._object.items.filter(item => item.variant_id === +variantId);
      
      if (!variantIdAlreadyInCart.length) {
        return { isInCart: false }
      } else {
        const allSelectedOptions = [...document.querySelectorAll('.js-selected-option')];
        const selectedOption = allSelectedOptions.find(option => +option.dataset.variantId === +variantId);
        const currentItem = selectedOption.closest('.js-cart-item')
        const selectedQuantity = currentItem.querySelector('.js-cart-item-quantity');
        selectedQuantity.innerText = +selectedQuantity.innerText + 1;
        
        return { isInCart: true, quantity: variantIdAlreadyInCart[0].quantity }
      }
    }

    function sortByDate(timestamp) {
      timestamp.sort(function(a,b){
        return Number(new Date(a.date)) - Number(new Date(b.date));
      });
      return timestamp.reverse();
    }

    function onAddToCartClick(e) {
      e.preventDefault();
      theme.openFlyout();
      var productId = e.target.getAttribute('data-product-id');
      var variantId = e.target.getAttribute('data-variant-id');
      var du = e.target.getAttribute('data-url');
      e.target.innerHTML = adding;

      window._swat.replayAddToCart(
        {empi: productId, du: du},
        variantId,
        function(item) {
        e.target.innerHTML = add;
        const checkProductInCart = isSelectedItemInCart(variantId);
        if (!checkProductInCart.isInCart) {
          // Swym adds to the cart, but the cart content is not updated, thus we perform an add and then we force the quantity to go back to 1
          $(document).trigger('Cart:add', JSON.parse(item));
          theme.cart.update({id: variantId, quantity: 1});
        } else {
          theme.cart.update({id: variantId, quantity: checkProductInCart.quantity + 1});          
        }
        // theme.openFlyout();
        console.log('Successfully added product to cart.');
      },
      function(e) {
        console.log(e);
      });
    }

    const outOfStockWishlist = (link) => {
      theme.modal.addTrigger($(link));
    }

    const splitTitle = (productModalTitle, productTitle) => {
      const genericTitle = productTitle.split('- ')[0];
      const colorTitle = productTitle.split('- ')[1];
      // Title generation
      if (genericTitle.length > 1) {
        productModalTitle.innerHTML = (productTitle.split('- ').length > 1) ?  genericTitle + `<br><span class="text-title-space">` + colorTitle.toLowerCase() + `</span>` : productTitle;
      }
    }

    const fillModalInformation = (product) => {
      //populate data from item
      const modalProductTitle = [...document.querySelectorAll('.js-out-of-stock-modal-prod-title')];
      const modalOptionTitle = [...document.querySelectorAll('.js-option-title')];
      const productATCText = product.dataset.atcText;
      const productTitle = product.dataset.title;
      let modalType = '';

      modalProductTitle.forEach(productModalTitle => {
        splitTitle(productModalTitle, productTitle);
      });

      modalOptionTitle.forEach(optionModalTitle => {
        if (optionModalTitle) optionModalTitle.innerText = product.dataset.variantInfo;
      });

      if (productATCText == theme.locales.product.coming_soon) {
        modalType = 'comingsoon';
      }

      theme.outOfStockData = {
        price: +product.dataset.price,
        variant_id: +product.dataset.variantId,
        product_id: +product.dataset.id,
        image: product.dataset.image,
        modal_type: modalType
      };
    }

    function attachClickListeners(isNotifyEvents) {
      const addToCartButtons = [...document.querySelectorAll('.custom-wishlist .js-add-to-cart')];
      addToCartButtons.forEach(addToCartButton => addToCartButton.addEventListener('click', onAddToCartClick, false));

      // Notify events
      if (isNotifyEvents) {
        const outOfStockLinks = [...document.querySelectorAll('.custom-wishlist .js-out-of-stock-trigger')];
        
        outOfStockLinks.forEach(outOfStockLink => {
          outOfStockWishlist(outOfStockLink);
          outOfStockLink.onclick = () => {  
            fillModalInformation(outOfStockLink); 
          }
        });
      }
    }

    function onRemoveProductClick(event) {
      event.preventDefault();
      const closeSVG = event.target;
      var productId = event.target.closest('button').getAttribute("data-product-id");
      var variantId = event.target.closest('button').getAttribute("data-variant-id");
      __wishlistedProducts.forEach(function(p) {
        if (p.empi == productId && p.epi == variantId) {
          window._swat.removeFromWishList(p, function(r) {
            console.log("response", r);
            const removeTrigger = closeSVG.closest('.js-remove-cart-item');
            const wishlistItems = [...document.querySelectorAll('.custom-wishlist .js-cart-item')];
            removeTrigger.closest('.js-cart-item').remove();
            
            if (wishlistItems.length - 1 < 1) { // if nothing left in the wishlist
              document.querySelector('.js-share-wishlist').classList.add('hide');
              wishlistContentsContainer.innerHTML = productEmptyCardMarkup;
            }
          });
        }
      });
    }

    function wishlistLoadingMessage() {
      wishlistContentsContainer.innerHTML = productLoadingCardMarkup;
    } 

    const wishlistInit = () => {
      wishlistLoadingMessage();
    }

    wishlistInit();
  }
})();
