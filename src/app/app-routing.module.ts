import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { DataGeneratorComponent } from './components/data-generator/data-generator.component';
import { HomeComponent } from './components/home/home.component';
import { ListingEditComponent } from './components/listing-edit/listing-edit.component';
import { ListingDetailsComponent } from './components/listing-search/listing-details/listing-details.component';
import { ListingSearchComponent } from './components/listing-search/listing-search.component';
import { ListingUploadComponent } from './components/listing-upload/listing-upload.component';
import { RouteGuardService } from './shared/route-guard.service';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'listings',
    component: ListingSearchComponent,
    children: [
      {
        path: 'details/:listingId',
        component: ListingDetailsComponent
      }
    ]
  },
  {
    path: 'listing-upload',
    component: ListingUploadComponent,
    canActivate: [
      RouteGuardService
    ]
  },
  {
    path: 'listing-edit',
    component: ListingEditComponent,
    canActivate: [
      RouteGuardService
    ]
  },
  {
    path: 'listing-generator',
    component: DataGeneratorComponent,
    canActivate: [
      RouteGuardService
    ]
  },
  {
    path: 'about-us',
    component: AboutUsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }