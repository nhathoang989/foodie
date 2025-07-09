import { NgModule } from '@angular/core';
import { PricePipe } from './price.pipe';

/**
 * Module that contains all custom pipes for the application
 * Can be imported in any other module where pipes are needed
 */
@NgModule({
  declarations: [],
  imports: [PricePipe],
  exports: [PricePipe]
})
export class PipesModule { }
