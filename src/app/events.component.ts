import { Component, Input, Output, EventEmitter } from "@angular/core";
import * as FileSaver from "file-saver";
import { Http, Response } from "@angular/http";
import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/map";

@Component({
  selector: "events",
  templateUrl: "./events.component.html",
  providers: [],
})
export class EventsComponent {
  @Input() url: string;
  @Input() localeUrlParameter: string;
  @Input() allFacets: string;
  @Input() keys: string;
  @Input() localeAndDateFormat: any;
  @Input() excludedLanguages: string[];

  @Output() finalResponse = new EventEmitter<any>();
  @Output() outParameters = new EventEmitter<string>();

  apiResponse: any;
  documents: any[];
  facetsResponse: any;
  noData: string;
  sortBy: string = "SortBy";
  upcoming: string = "Upcoming";
  past: string = "Past";
  date: string = "Date";
  bestMatch: string = "BestMatch";
  addToCalendar: string = "addtocalendar";
  i18n: any;
  isSearch: boolean = false;
  srt: string;
  futureOrPast: string;
  isSrt: boolean = true;

  constructor(private http: Http) {}

  ngOnChanges() {
    this.getData(this.url);
  }

  getData = function (url: string) {
    let i18nUrl = this.localeUrlParameter + this.keys + "," + this.allFacets;
    let numberOfRows = Number(this.getParameterByName("rows", url));
    let languageExact = this.getParameterByName("lang_exact", url);
    let qterm = this.getParameterByName("qterm", this.url);
    url = url.slice(-1) == "&" ? url.slice(0, -1) : url;

    this.isSrt = this.getParameterByName("srt", this.url) == "" ? false : true;

    if (qterm == null || qterm == "") {
      url =
        url.indexOf("futureevents=") === -1 && url.indexOf("pastevents=") === -1
          ? url + "&futureevents=on"
          : url;
      url =
        url.indexOf("pastevents=") === -1
          ? url
          : url + "&srt=eventstartdate&order=desc";
      this.futureOrPast =
        url.indexOf("futureevents=") === -1 ? "pastevents" : "futureevents";
      this.isSearch = false;
    } else {
      url = url.indexOf("srt=") === -1 ? url + "&srt=score" : url;
      this.futureOrPast = "";
      this.srt = this.getParameterByName("srt", url);
      this.isSearch = true;
    }

    const combined = Observable.forkJoin(
      this.http.post(url, "").map((response: Response) => {
        //console.log('api ' + new Date);
        return response.json();
      }),
      this.http.post(i18nUrl, "").map((response: Response) => {
        //console.log('i18n ' + new Date);
        return response.json();
      })
    );

    combined.subscribe((combinedValues) => {
      const [apiResponse, i18nResponse] = combinedValues;
      this.apiResponse = apiResponse;
      this.i18n = i18nResponse;
      this.facetsResponse = this.apiResponse.documents.facets;
      let total = this.apiResponse.total;
      let showingTo,
        isLoadMore,
        facets = [];

      if (Object.keys(this.facetsResponse).length == 0) {
        showingTo = 0;
        isLoadMore = false;
        if (qterm == null || qterm == "") {
          let key = "";
          if (url.indexOf("pastevents=") === -1) {
            key = "NoResultsMsgFuture";
          } else {
            key = "NoResultsMsgPast";
          }
          this.noData = this.i18n[key];
        } else {
          this.isSrt = false;
          this.http
            .post(this.localeUrlParameter + "&keys=NoResultsMsg", "")
            .map((res: Response) => res.text())
            .subscribe((response) => {
              this.noData =
                response.trim().split(":")[1].slice(1).slice(0, -8) + "</a>";
            });
        }
      } else {
        for (let facetName in this.facetsResponse) {
          let facetItems = [];
          for (let facetItemKey in this.facetsResponse[facetName]) {
            facetItems.push(this.facetsResponse[facetName][facetItemKey]);
          }
          facets.push({ facetName: facetName, facetItems: facetItems });
        }

        delete this.apiResponse.documents.facets;
        let documents = {};
        let docs = [];

        Object.keys(this.apiResponse.documents).forEach((key) => {
          let eventDate =
            this.apiResponse.documents[key].eventstartdate.split("T")[0] +
            "T00:00:00Z";

          if (documents.hasOwnProperty(eventDate)) {
            docs.push(this.apiResponse.documents[key]);
          } else {
            docs = [];
            docs.push(this.apiResponse.documents[key]);
            documents[eventDate] = docs;
          }
        });
        this.documents = documents;
        showingTo = numberOfRows >= total ? total : numberOfRows;
        isLoadMore = numberOfRows >= total ? false : true;
      }
      this.finalResponse.emit({
        i18n: this.i18n,
        facets: facets,
        total: total,
        showingTo: showingTo,
        isLoadMore: isLoadMore,
        loading: false,
      });
    });
  };

  public getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  public getSortBy(event) {
    this.outParameters.emit(event);
  }

  evtformatTime(date) {
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  }

  public onAddToCalendar(
    title: any,
    eventStartDate: any,
    eventEndDate: any,
    desc: any,
    url: any
  ) {
    var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let startDate = eventStartDate;
    let endDate = eventEndDate;

    /* startDate = new Date(startDate);
    endDate = new Date(endDate); */
    const StdateObj = new Date(startDate);
    const Sthour = StdateObj.getUTCHours();
    const Stminute = StdateObj.getUTCMinutes();
    const Stseconds = StdateObj.getUTCSeconds();
    const Stdt = startDate.split("T");
    const Stdttime =
      Stdt[0] + " " + Sthour + ":" + Stminute + ":" + Stseconds + " -0400";

    const EndateObj = new Date(endDate);
    const Enhour = EndateObj.getUTCHours();
    const Enminute = EndateObj.getUTCMinutes();
    const Enseconds = EndateObj.getUTCSeconds();
    const Endt = endDate.split("T");
    const Endttime =
      Endt[0] + " " + Enhour + ":" + Enminute + ":" + Enseconds + " -0400";

    var startTime = new Date(Stdttime).toLocaleString("en-US", {
      timeZone: timezone,
    });

    var endTime = new Date(Endttime).toLocaleString("en-US", {
      timeZone: timezone,
    });

    startTime = this.evtformatTime(new Date(startTime));
    endTime = this.evtformatTime(new Date(endTime));

    /* let start = this.replaceAll(startDate, "-", "");
    let end = this.replaceAll(endDate, "-", ""); */
    let descData =
      desc["cdata!"]; /* + encodeURIComponent("<br> [url]" + url + "[/url]") */

    let icsData =
      "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nCLASS:PUBLIC\nDTSTART:" +
      startTime +
      "\nDTEND:" +
      endTime +
      "\nSUMMARY:" +
      title["cdata!"] +
      "\nDESCRIPTION:" +
      descData +
      "\nTRANSP:TRANSPARENT\nEND:VEVENT\nEND:VCALENDAR\nPRODID://World Bank//EN";
    let icsBlob = new Blob([icsData], {
      type: "application/octet-stream",
    });
    FileSaver.saveAs(icsBlob, "event.ics");
  }

  public replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, "g"), replace);
  }
}
