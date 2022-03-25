import { Component, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Listing } from '../listing-search.data';
import { ListingDetailsService } from './listing-details.service';
import { DomSanitizer, Meta, SafeUrl } from '@angular/platform-browser';
import { Title } from "@angular/platform-browser";
import { SwiperComponent } from 'ngx-useful-swiper';
import { lastValueFrom } from 'rxjs';
import mergeImages from 'merge-images';

@Component({
    selector: 'listing-details',
    templateUrl: 'listing-details.component.html',
    styleUrls: ['../listing-search.component.scss', './listing-details.component.scss']
})

export class ListingDetailsComponent implements OnInit {
    listing: Listing = {} as Listing;
    images: Array<Object> = [];
    contactNumberUrl: SafeUrl = '';

    watermarkImg = '';

    @ViewChild('usefulSwiper', { static: false }) usefulSwiper!: SwiperComponent;
    highlightedThumbnailRef: any;

    constructor(
        private sanitizer: DomSanitizer,
        private translate: TranslateService,
        private listingDetailsService: ListingDetailsService,
        private route: ActivatedRoute,
        private router: Router,
        private title: Title) {
    }

    async ngOnInit() {
        const id = this.route.snapshot.paramMap.get('listingId');
        if (!id) {
            this.router.navigate(['/listing-search']);
            return;
        }

        const listing = await this.listingDetailsService.getListingById(id);
        if (!listing) {
            this.router.navigate(['/listing-search']);
            return;
        }

        this.listing = listing;

        this.listingDetailsService.getListingImageUrls(listing?.fireStoragePath!).then(async imgSrcs => {
            if (imgSrcs.length) {
                await this.applyWatermarkToImagesAndDisplay(imgSrcs);
            }
        });

        if (listing.contactNumber) {
            this.contactNumberUrl = this.sanitizer.bypassSecurityTrustUrl(
                `tel:${listing.contactNumber}`
            );
        } else {
            this.contactNumberUrl = this.sanitizer.bypassSecurityTrustUrl(
                `tel:${await lastValueFrom(this.translate.get('listing_details.default_contact_number'))}`
            );
        }

        this.setHeaderMetadata();
    }

    cycleToSlide(slideId: number) {
        this.usefulSwiper?.swiper.slideTo(slideId);
    }

    async applyWatermarkToImagesAndDisplay(imgSrcs: string[]) {
        const tempImageSrcs = new Array<string>(imgSrcs.length);
        const tempImages = new Array<Object>(imgSrcs.length);

        // Fetch watermark image
        if (!this.watermarkImg) {
            const response = await fetch('/assets/images/logo.png');
            const data = await response.blob();
            const contentType = response.headers.get('content-type') || '';
            const metadata = {
                type: contentType
            };
            const fileExtension = contentType.split('/').pop() || '';
            const file = new File([data], `watermark.${fileExtension}`, metadata);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                this.watermarkImg = reader.result as string;
            };
        }

        // Apply the watermark to images from Firebase
        await Promise.all(imgSrcs.map(async (imgSrc, index) => {

            // Get Firebase image
            const response = await fetch(imgSrc);
            const blob = await response.blob();
            const file = new File([blob], `${index}.jpg`, { type: blob.type });

            let imgAsBase64 = '';
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                imgAsBase64 = reader.result as string;

                //Apply watermark to Firebase image
                const watermarkedImgBase64 = await mergeImages([imgAsBase64, this.watermarkImg]);
                tempImageSrcs[index] = watermarkedImgBase64;

                //Create thumbnails
                const sanitizedUrl = this.sanitizer.sanitize(
                    SecurityContext.URL,
                    this.sanitizer.bypassSecurityTrustUrl(watermarkedImgBase64)
                );
                tempImages[index] = {
                    image: sanitizedUrl,
                    thumbImage: sanitizedUrl,
                    alt: `Image ${index}`
                }
            }
        }));

        this.listing.imageSources = tempImageSrcs;
        this.images = tempImages;
    }

    async setHeaderMetadata() {
        const langTerms = await lastValueFrom(this.translate.get(
            [
                "app_title",
                "listing_details.bedrooms",
                "listing_details.bathrooms",
                "listing_details.apartment",
                "listing_details.villa",
                "listing_details.townhouse",
                "listing_details.commercial"]
        ));


        this.title.setTitle(`${langTerms['app_title']} | ${this.listing.location} ${this.listing.price} ${this.listing.currency}`);

        let keyToUse = '';
        if (this.listing.category !== 'Commercial') {
            switch (this.listing.category) {
                case 'Apartment':
                    keyToUse = "listing_details.apartment";
                    break;
                case 'Townhouse':
                    keyToUse = "listing_details.townhouse";
                    break;
                case 'Villa':
                    keyToUse = "listing_details.villa";
                    break;
            }
        }
    }
}