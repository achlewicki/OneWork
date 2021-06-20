import {Component, OnInit} from '@angular/core';
import {faChartBar, faClipboardList, faComments, faDoorOpen, faThLarge, faUsers} from '@fortawesome/free-solid-svg-icons';
import {EmployeeService} from '../../../../services/employee-service/employee.service';
import {AngularFireStorage} from '@angular/fire/storage';
import {MatDialog, MatSnackBar} from '@angular/material';
import {CompanyManagementComponent} from '../../dialogs/company-management/company-management.component';
import {faBuilding} from '@fortawesome/free-regular-svg-icons';
import {SharedDataService} from '../../../../services/_shared-data/shared-data.service';
import {LogsService} from '../../../../services/logs-service/logs.service';
import {AuthorizationService} from '../../../../services/authorization-service/authorization.service';
import {Subscription} from 'rxjs';


@Component({
  selector: 'one-work-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss'],
})

export class NavigationBarComponent implements OnInit {
  private messageIcon = faComments;
  private rankingIcon = faChartBar;
  private projectsIcon = faClipboardList;
  private dashboardIcon = faThLarge;
  private logoutIcon = faDoorOpen;
  private activeComponent: string;
  private photoUrl: string;
  private employeesManagementIcon = faUsers;
  private companyManagementIcon = faBuilding;
  private lastActiveComponent: string;
  private photoSubscriber$: Subscription;

  constructor(private readonly employeeService: EmployeeService,
              private readonly storage: AngularFireStorage,
              private readonly sharedData: SharedDataService,
              private readonly logsService: LogsService,
              private readonly authorization: AuthorizationService,
              public snackBar: MatSnackBar,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    if(localStorage.getItem('activeComponent')) this.activeComponent = localStorage.getItem('activeComponent')
    else {
      this.activeComponent = 'dashboard'
      localStorage.setItem('activeComponent', this.activeComponent);
    }
    this.photoSubscriber$ = this.storage.ref(this.sharedData.companyDocumentId + '/photos/' + this.sharedData.employeeDetails.documentId + '.png')
      .getDownloadURL().subscribe(photo => {
        if(photo)this.photoUrl = photo;
        else this.photoUrl = 'src/assets/new-user.avatar.png'
      });
  }

  private changeActiveComponent(component: string): void {
    if(component === 'Zarządzanie Firmą') this.lastActiveComponent = this.activeComponent
    this.activeComponent = component;
    localStorage.setItem('activeComponent', this.activeComponent);
  }

  private openDialog(): void {
    this.dialog.open(CompanyManagementComponent, {
      width: '900px'
    }).afterClosed().subscribe(() => {
      this.activeComponent = this.lastActiveComponent
      localStorage.setItem('activeComponent', this.activeComponent);
    })
  }

  private logOut(): void {
    this.logsService.closeLog(this.sharedData.employeeDetails.documentId, this.sharedData.employeeDetails.activeLogId).then(() => {
      this.employeeService.setActiveLogId(this.sharedData.employeeDetails.documentId, '');
      this.authorization.signOut().then(() => this.snackBar.open('Wylogowano.', 'OK', {duration: 6000})).catch(e => console.log(e))
    })
  }

}
