import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit {
    @ViewChild('printFrame', { static: true })
    printFrame!: ElementRef;
    @ViewChild('myDropDownList', { static: true })
    myDropDownList!: ElementRef;
    selectedFormat = 'pdf';
    printUrl = this.sanitizer.bypassSecurityTrustResourceUrl("");

    htmlContent: SafeHtml | undefined;


    constructor(private sanitizer: DomSanitizer, private _http: HttpClient) {
    }

    ngOnInit(): void {
        this.getFile();
    }

    onChange($event: any) {
        this.selectedFormat = $event.target.value;
    }
    printInNewWindow(url: string) {
        var frameElement = window.open(url, "_blank");
        frameElement?.addEventListener("load", function (e) {
            if (frameElement && frameElement.document.contentType !== "text/html")
                frameElement.print();
        });
    }
    printWithIFrame(url: string) {
        var iframe = this.printFrame.nativeElement as HTMLIFrameElement;
        iframe.addEventListener("load", () => {
            if (iframe.contentDocument?.contentType != "text/html")
                iframe.contentWindow?.print();
        });
        this.printUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    export(url: string) {
        window.open(url, "_blank");
    }
    downloadFile() {
        this._http.get('api/Home/Export', {
            params: { "format": this.selectedFormat }, responseType: 'blob'
        }).subscribe(blob => {
            saveAs(blob, 'TestReport.' + this.selectedFormat.toLowerCase());
        });
    }
    getFileContent(url: string): Observable<string> {
        return this._http.get(url, { responseType: 'text' });
    }
    getFile(): void {
        const url = 'https://localhost:5141/api/Home/Export?format=HTML';
        this.getFileContent(url).subscribe(
            (data: string) => {
                var fileContent = data;
                this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(fileContent);
                console.log(this.htmlContent);
            },
            (error) => {
                console.error('Error:', error);
            }
        );
    }
}