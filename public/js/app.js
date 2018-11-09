/**
 * Hack to prevent scrolling to hash tags from bootstrap tabs
 */
var is_citation = false;
var citationDiv;
if (location.hash) {               // do the test straight away
    window.scrollTo(0, 0);         // execute it straight away
    setTimeout(function() {
        if(is_citation === false) {
            var scrollTop = $(window).scrollTop();
            if(scrollTop != 0) {
                window.scrollTo(0, 0);     // run it a bit later also for browser compatibility
            }
        } else {
            $(window).scrollTop(citationDiv.offset().top);
            //$("html").scrollTop(citationDiv.offset().top);
        }
    }, 1);
}

//alias the global object
//alias jQuery so we can potentially use other libraries that utilize $
//alias Backbone to save us on some typing
(function(exports, $, bb){

    //document ready
    $(function(){

        /**
         ***************************************
         * Cached Globals
         ***************************************
         */
        var $window, $body, $document;

        $window  = $(window);
        $document = $(document);
        $body   = $('body');

        /**
         * Reset Bootstrap tooltips
         */
        $('.ttip').tooltip('hide');

        /**
         * Reset Bootstrap modals
         */
        $('.modal-trigger').modal('hide');

        /**
         * Reset Bootstrap popovers
         */
        $('[data-toggle="popover"]').popover();
        $body.on('click', function (e) {
            $('[data-toggle="popover"]').each(function () {
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    $(this).popover('hide');
                }
            });
        });

        var one_col_tooltip_options = {
            animation: true,
            container: false,
            //delay: { show: 500, hide: 100 },
            delay: 0,
            html: true,
            placement: 'right',
            selector: false,
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
            //title: function(e) {
            title: function() {
                var sub = $(this).html();
                return $('#one-col-footnote-' + sub).html();
            },
            trigger: 'hover focus',
            viewport: { selector: 'body', padding: 0 }
        };

        var three_col_tooltip_options = one_col_tooltip_options;
        //three_col_tooltip_options.title = function(e) {
        three_col_tooltip_options.title = function() {
            return $('#three-col-footnote-' + $(this).html()).html();
        };

        $("a[id*='one_col_sup_']").tooltip(one_col_tooltip_options);
        $("a[id*='three_col_sup_']").tooltip(three_col_tooltip_options);

        $("form").submit(function(e) {
            e.preventDefault();//prevent the form from actually submitting
            var search_term = $(this).find("input[name=search-box]").val();
            if (search_term.length) {
                window.location = '/Search/' + search_term;
            } else {
                $("#search-error").text("Not valid!").show().fadeOut( 1000 );
            }
        });

        /**
         * Remember active tab
         */
        $('#heading-tabs a,#dropdown-heading-tabs a').on('click', function (e) {
            e.preventDefault();
            $(this).tab('show');
        });

        $('.heading-nav-left.disabled,.heading-nav-right.disabled').on('click', function(e) {
            e.preventDefault();
            return false;
        });

        window.verse_number = 1;

        /**
         * Populate verse modal
         */
        $('.modal-trigger.verse-number').on('click', function (e) {
            window.verse_number = $(e.target).html();
            populateVerseModal(window.verse_number);
        });

        $('#nav-links-light-verse-left').on('click', function (e) {
            e.preventDefault();
            window.verse_number--;
            populateVerseModal(window.verse_number);
        });

        $('#nav-links-light-verse-right').on('click', function (e) {
            e.preventDefault();
            window.verse_number++;
            populateVerseModal(window.verse_number);
        });

        window.isTabShown = false;
        window.heading_tabs = $("#heading-tabs");

        /**
         * Populate keyword modal
         */
        $('.modal-trigger.keyword-modal').on('click', function (e) {
            var keyword_value = e.target.innerHTML;
            var keyword_verse_number = parseInt(e.target.id, 10);
            var keyword_color = $("#" + keyword_verse_number + '_keyword_color').html();
            $("#keyword_modal_header").attr('class', 'modal-header ' + keyword_color);
            var keyword_description = $("#" + keyword_verse_number + '_keyword_description').html();
            $("#keywordModalLabel").html(keyword_value);
            $("#keyword_modal_paragraph").html(keyword_description);
        });

        /**
         * Store the currently selected tab in the hash value and update nav links
         */
        $("ul.nav-pills > li > a,ul.dropdown-menu > li > a").on("shown.bs.tab", function (e) {
            var id = $(e.target).attr("href").substr(1);
            var hash = "#" + id;
            selectTab(hash);
            setNavHash(hash);
            window.isTabShown = true;
        });

        $("#index-aside").find("a").on('click', function (e) {
            window.location = $(e.currentTarget).attr("href");
        });

        /**
         * On load of the page: switch to the currently selected tab
         */
        var hash = window.location.hash;

        if(location.pathname.indexOf('/Concordance') == -1 && location.pathname.indexOf('/Search') == -1) {
            if (location.pathname != '/') {
                if (hash != "") {
                    selectTab(hash);
                    setNavHash(hash);
                } else {
                    hash = "#one_col";
                    selectTab(hash);
                    setNavHash(hash);
                }
            } else {
                if (hash != "") {
                    setNavHash(hash);
                } else {
                    setNavHash("#one_col");
                }
            }
        }

        window.heading_tabs.find('li > a').click(function (e) {
            var t = e.target;
            if (t.parentElement.href != undefined) {
                var parentHref = t.parentElement.href;
                var hashStart = parentHref.indexOf("#");
                if(hashStart != -1) {
                    var hash = parentHref.substr(hashStart);
                    selectTab(hash);
                }
                return false;
            } else {
                return true;
            }
        });

        function setNavHash(hash) {
            var angle_left_top = $('#nav-left-top.fa-angle-left');
            if(typeof angle_left_top.attr('href') != 'undefined') {
                angle_left_top.attr('href', angle_left_top.attr('href').split('#')[0] + hash);
            }
            var angle_left_bottom = $('#nav-left-bottom.fa-angle-left');
            if(typeof angle_left_bottom.attr('href') != 'undefined') {
                angle_left_bottom.attr('href', angle_left_bottom.attr('href').split('#')[0] + hash);
            }
            var angle_right_top = $('#nav-right-top.fa-angle-right');
            if(typeof angle_right_top.attr('href') != 'undefined') {
                angle_right_top.attr('href', angle_right_top.attr('href').split('#')[0] + hash);
            }
            var angle_right_bottom = $('#nav-right-bottom.fa-angle-right');
            if(typeof angle_right_bottom.attr('href') != 'undefined') {
                angle_right_bottom.attr('href', angle_right_top.attr('href').split('#')[0] + hash);
            }
            var chapter_sel = $('.btn-chapter-sel');
            if(typeof chapter_sel.attr('href') != 'undefined') {
                chapter_sel.each(function(){
                    $(this).attr('href', $(this).attr('href').split('#')[0] + hash);
                });
            }
        }

        function selectTab(hash) {
            var heading_tabs_li = window.heading_tabs.find('li');
            heading_tabs_li.removeClass('active');
            heading_tabs_li.find("a[href$=" + hash + "]").closest("li").addClass("active");
            $('.tab-content > .tab-pane').hide();
            location.hash = hash;
            $(hash).show();
        }

        function populateVerseModal(verse_number) {
            var chapter_number = $('#chapter-number').html();
            var kjv_text = $('#kjv_' + verse_number).html();
            var iit_text = $('#iit_' + verse_number).html();
            iit_text = iit_text.replace(/<a\b[^>]*>(.*?)<\/a>\s?/i,"");
            iit_text = "<p>" + iit_text + "</p>";
            var heb_text = $('#heb_' + verse_number).html();
            var commentary_text = $('.commentary_' + verse_number).html();
            $('#kjv-modal-verse').html(kjv_text);
            $('#iit-modal-verse').html(iit_text);
            $('#heb-modal-verse').html(heb_text);
            var commentary_modal_verse = $('#commentary-modal-verse');
            commentary_modal_verse.html(commentary_text);
            var subject_verses = commentary_modal_verse.children("div").html();
            commentary_modal_verse.children().next('p').first().prepend(subject_verses + ' ');
            $('#verse-modal-label').html('Isaiah ' + chapter_number + ':' + verse_number);
            updatePagination(parseInt(verse_number));
        }

        //TODO: Paginator only works sequentially. This is a problem for verses out of sequence. Need to write special exceptions for stuff like chapter 40/41:7*
        function updatePagination(verse_number) {
            var left_pager = $('#nav-links-light-verse-left');
            var prev_verse = verse_number - 1;
            if(prev_verse >= 1) {
                left_pager.disable(false);
            } else {
                left_pager.disable(true);
            }
            var right_pager = $('#nav-links-light-verse-right');
            var verse_count = $('#verse-count').html();
            var next_verse = verse_number + 1;
            if(next_verse <= verse_count) {
                right_pager.disable(false);
            } else {
                right_pager.disable(true);
            }
        }

        var getQueryStringKey = function(key) {
            return getQueryStringAsObject()[key];
        };


        var getQueryStringAsObject = function() {
            var b, cv, e, k, ma, sk, v, r = {},
                d = function (v) { return decodeURIComponent(v).replace(/\+/g, " "); }, //# d(ecode) the v(alue)
                q = window.location.search.substring(1),
                s = /([^&;=]+)=?([^&;]*)/g //# original regex that does not allow for ; as a delimiter:   /([^&=]+)=?([^&]*)/g
                ;

            //# ma(make array) out of the v(alue)
            ma = function(v) {
                //# If the passed v(alue) hasn't been setup as an object
                if (typeof v != "object") {
                    //# Grab the cv(current value) then setup the v(alue) as an object
                    cv = v;
                    v = {};
                    v.length = 0;

                    //# If there was a cv(current value), .push it into the new v(alue)'s array
                    //#     NOTE: This may or may not be 100% logical to do... but it's better than loosing the original value
                    if (cv) { Array.prototype.push.call(v, cv); }
                }
                return v;
            };

            //# While we still have key-value e(ntries) from the q(uerystring) via the s(earch regex)...
            while (e = s.exec(q)) { //# while((e = s.exec(q)) !== null) {
                //# Collect the open b(racket) location (if any) then set the d(ecoded) v(alue) from the above split key-value e(ntry)
                b = e[1].indexOf("[");
                v = d(e[2]);

                //# As long as this is NOT a hash[]-style key-value e(ntry)
                if (b < 0) { //# b == "-1"
                    //# d(ecode) the simple k(ey)
                    k = d(e[1]);

                    //# If the k(ey) already exists
                    if (r[k]) {
                        //# ma(make array) out of the k(ey) then .push the v(alue) into the k(ey)'s array in the r(eturn value)
                        r[k] = ma(r[k]);
                        Array.prototype.push.call(r[k], v);
                    }
                    //# Else this is a new k(ey), so just add the k(ey)/v(alue) into the r(eturn value)
                    else {
                        r[k] = v;
                    }
                }
                //# Else we've got ourselves a hash[]-style key-value e(ntry)
                else {
                    //# Collect the d(ecoded) k(ey) and the d(ecoded) sk(sub-key) based on the b(racket) locations
                    k = d(e[1].slice(0, b));
                    sk = d(e[1].slice(b + 1, e[1].indexOf("]", b)));

                    //# ma(make array) out of the k(ey)
                    r[k] = ma(r[k]);

                    //# If we have a sk(sub-key), plug the v(alue) into it
                    if (sk) { r[k][sk] = v; }
                    //# Else .push the v(alue) into the k(ey)'s array
                    else { Array.prototype.push.call(r[k], v); }
                }
            }

            //# Return the r(eturn value)
            return r;
        };

        var citationQueryString = getQueryStringKey('citation');
        if(citationQueryString != undefined) {
            var citationLink = $('a[href*=' + citationQueryString + ']');
            if(citationLink != undefined) {
                if(location.pathname.indexOf('/Concordance') == -1) {
                    citationDiv = citationLink.parent().closest('div');
                    citationLink.addClass('highlight');
                } else {
                    citationDiv = citationLink.parent();
                    citationDiv.addClass('highlight');
                }
                if (citationDiv != undefined) {
                    is_citation = true;
                }
            }
        }

        $.fn.extend({
            disable: function(state) {
                return this.each(function() {
                    var $this = $(this);
                    $this.toggleClass('disabled', state);
                });
            }
        });
    });//end document ready

}(this, jQuery, Backbone));