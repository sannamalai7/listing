function analyticParams(e, t, a, s) {
  query_string = e;
  var c = "",
    r = "",
    n = [],
    i = [],
    o = "",
    _ = "",
    p = {
      displayconttype_exact: "type",
      topic_exact: "topic",
      admreg_exact: "region",
      count_exact: "country",
      strdate: "startdate",
      enddate: "enddate",
      lang_exact: "language",
      tf: "timeframe",
      docty_exact: "document type",
      lang_spoken_exact: "languages spoken",
      job_title_exact: "role",
      unit_exact: "unit",
      first_name_AlphaBucket_exact: "first name",
      surname_AlphaBucket_exact: "last name",
      sector_exact: "sector",
      status_exact: "status",
      majdocty_exact: "major document type",
      majtheme_exact: "theme",
      teratopic_exact: "topic",
    };
  if (query_string) {
    for (var u = query_string.slice(1).split("&"), g = 0; g < u.length; g++)
      (c = u[g].split("=")[1]),
        (r = u[g].split("=")[0]),
        void 0 !== p[r] &&
          "lang_exact" != r &&
          "pastevents" != r &&
          "futureevents" != r &&
          "srt" != r &&
          "qterm" != r &&
          "x" != r &&
          "y" != r &&
          i.push(p[r]),
        "qterm" != r &&
          "futureevents" != r &&
          "pastevents" != r &&
          "srt" != r &&
          "os" != r &&
          "x" != r &&
          "lang_exact" != r &&
          "y" != r &&
          "" != c &&
          n.push(c);
    (o = n.join(":")),
      (_ = i.join(":")),
      (_ = decodeURIComponent(_)),
      (_ = _.replace(new RegExp("\\+", "g"), " ")),
      (o = decodeURIComponent(o)),
      (o = o.replace(new RegExp("\\+", "g"), " ")),
      (wbgData.siteSearch.searchFilters = o),
      (wbgData.siteSearch.section = _),
      (wbgData.siteSearch.searchTerm = t),
      (wbgData.siteSearch.searchResults = a),
      (wbgData.siteSearch.sortBy = s);
  }
  _satellite.track("sitesearch");
}
var query_string = "";
