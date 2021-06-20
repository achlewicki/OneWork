import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {RegistrationCodeModel} from '../../../../models/registrationCode.model';
import {CompanyService} from '../../../../services/company-service/company.service';
import {CompanyModel} from '../../../../models/company.model';
import {Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {faBuilding, faEdit} from '@fortawesome/free-regular-svg-icons';
import {faCheck, faTimes, faTrash} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'one-work-company-management',
  templateUrl: './company-management.component.html',
  styleUrls: ['./company-management.component.scss']
})
export class CompanyManagementComponent implements OnInit, OnDestroy {
  private registrationCodes: RegistrationCodeModel [];
  private company: CompanyModel;
  private codesSubscriber$: Subscription;
  private companySubscriber$: Subscription;
  private companyEditForm: FormGroup;
  private newRegistrationCodeForm: FormGroup;
  private allCodesValuesSubscriber$: Subscription;
  private allCodesValues: string [];
  private characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWYXYZ1234567890';
  private todayDate: Date =  new Date();
  private tomorrowDate: Date = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate() + 1);
  private companyIcon = faBuilding;
  private validIcon = faCheck;
  private invalidIcon = faTimes;
  private deleteIcon = faTrash;
  private editIcon = faEdit;

  constructor(private readonly matDialogRef: MatDialogRef<CompanyManagementComponent>,
              private readonly companyService: CompanyService,
              private readonly formBuilder: FormBuilder) { }

  ngOnInit() {
    this.codesSubscriber$ = this.companyService.getAllRegistrationCodes().subscribe(codes => {
      this.registrationCodes = codes;
    });

    this.companySubscriber$ = this.companyService.getCompanyInfo().subscribe(companyInfo => {
      this.company = companyInfo;
      if(companyInfo != undefined) {
        this.companyEditForm = this.formBuilder.group({
          name: [this.company.name, [Validators.required]],
          mail: [this.company.mail,[Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
          phone: [this.company.phone, [Validators.required]],
          address: this.formBuilder.group({
            street: [this.company.address.street, [Validators.required]],
            city: [this.company.address.city, [Validators.required]],
            state: [this.company.address.state, [Validators.required]],
            zip_code: [this.company.address.zip_code, [Validators.required]]
          })
        })
      }
    });

    this.allCodesValuesSubscriber$ = this.companyService.getAllCodesValues().subscribe(data => this.allCodesValues = data);

    this.newRegistrationCodeForm = this.formBuilder.group({
      remaining_number_of_times_to_use: [1, [Validators.required]],
      expires_after: [new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate() + 14), [Validators.required]],
    })
  }

  ngOnDestroy() {
    if(this.codesSubscriber$ != undefined) this.codesSubscriber$.unsubscribe();
    if(this.companySubscriber$ != undefined) this.companySubscriber$.unsubscribe();
    if(this.allCodesValuesSubscriber$ != undefined) this.allCodesValuesSubscriber$.unsubscribe();
  }

  private generateNewCodeValue(): string {
    let generatedCode: string = '';

    for(let i = 0; i < 6; i++) {
      generatedCode += this.characters.charAt(Math.floor(Math.random() * this.characters.length))
    }

    if(!this.allCodesValues.find(singleCode => singleCode === generatedCode)) return generatedCode;
    else this.generateNewCodeValue();
  }

  private addNewRegistrationCode(): void {
    if(this.newRegistrationCodeForm.valid) {
      const newCode: RegistrationCodeModel = {
        value: this.generateNewCodeValue(),
        valid: true,
        expires_after: Timestamp.fromDate(this.newRegistrationCodeForm.value.expires_after),
        remaining_number_of_times_to_use: this.newRegistrationCodeForm.value.remaining_number_of_times_to_use as number
      }
      this.companyService.addNewRegistrationsCode(newCode);
    }
  }

  private deleteRegistrationCode(codeId: string): void {
    this.companyService.deleteRegistrationCode(codeId);
  }

  private updateCompanyInfo(): void {
    if(this.companyEditForm.valid) {
      const companyData: CompanyModel = {
        name: this.companyEditForm.value.name,
        mail: this.companyEditForm.value.mail,
        phone: this.companyEditForm.value.phone,
        valid: true,
        address: {
          zip_code: this.companyEditForm.get('address')['controls'].zip_code.value,
          city: this.companyEditForm.get('address')['controls'].city.value,
          street: this.companyEditForm.get('address')['controls'].street.value,
          state: this.companyEditForm.get('address')['controls'].state.value
        }
      }
      this.companyService.updateCompanyInfo(companyData);
    }
  }
}
