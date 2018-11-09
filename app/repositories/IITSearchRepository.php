<?php

class IITSearchRepository {
    /**
     * Gets html for the chapter index
     *
     * @return string Chapter selection widget html
     */
    public static function GetIITSearchIndex() {
        return Heading::all();
    }

    /**
     * @param $search_term
     * @param int $page
     * @param int $limit
     * @return mixed
     */
    public function GetIITSearchTerm($search_term, $page = 1, $limit = 10) {
        $result['count'] = 0;
        $result['html'] = '';
        $result_count = 0;
        $search_html = '';
        $EOL = PHP_EOL;

        $results = $this->_getIITSearchResults($search_term, $page, $limit);

        $search_results = $results['results'];
        $total_count = $results['count'];

        if(!empty($search_results)) {
            $result_count = count($search_results);

            $ol_start = (($page - 1) * $limit) + 1;

            $search_html = <<<EOT
<ol start="$ol_start">$EOL
EOT;

            for ($i = 0; $i < $result_count; $i++) {
                $chapter_number = $search_results[$i]->chapter_number;
                $verse_number = $this->_strrtrim($search_results[$i]->verse_number, '.0');
                $scripture_text = html_entity_decode($search_results[$i]->scripture_text);
                $search_html .= <<<EOT
<li>${scripture_text} - <i>Isaiah ${chapter_number}:${verse_number}</i></li>
EOT;
            }

            $search_html .= <<<EOT
</ol>$EOL
EOT;
        }

        $result['count'] = $total_count;
        $result['html'] = $search_html;
        $result['paginator'] = Paginator::make($search_results, $total_count, $limit);

        return $result;
    }

    /**
     * Get the concordance words for specified letter
     *
     * @param string $search_term
     * @param int $page
     * @param int $limit
     * @return array
     */
    private function _getIITSearchResults($search_term, $page = 1, $limit = 10) {
        $offset = ($page - 1) * $limit;
        $results = DB::table('volumes')
            ->limit($limit)
            ->offset($offset)
            /*->orderBy('volumes.id')
            ->orderBy('books.id')
            ->orderBy('chapters.id')
            ->orderBy('verses.id')*/
            ->join('books', function($join)
            {
                $join->on('volumes.id', '=', 'books.volume_id');
            })
            ->join('chapters', function($join)
            {
                $join->on('books.id', '=', 'chapters.book_id');
            })
            ->join('verses', function($join)
            {
                $join->on('chapters.id', '=', 'verses.chapter_id');
            })
            ->where('books.book_title', '=', 'Isaiah IIT')
            ->where(function($query) use ($search_term) {
                $terms = explode(' ', $search_term);
                $term_count = count($terms);
                for($i = 0; $i < $term_count; $i++) {
                    $query->where('verses.scripture_text', 'LIKE', '%' . $terms[$i] . '%', 'and');
                }
            })
            ->select('chapters.id as chapter_id', 'verses.id as verse_id', 'chapters.chapter_number',
                'verses.verse_number', 'verses.scripture_text', 'verses.segment_id',
                'verses.is_poetry', 'verses.one_col_html',  'verses.three_col_html')->get();
        $count_result = DB::table('volumes')
            /*->orderBy('volumes.id')
            ->orderBy('books.id')
            ->orderBy('chapters.id')
            ->orderBy('verses.id')*/
            ->join('books', function($join)
            {
                $join->on('volumes.id', '=', 'books.volume_id');
            })
            ->join('chapters', function($join)
            {
                $join->on('books.id', '=', 'chapters.book_id');
            })
            ->join('verses', function($join)
            {
                $join->on('chapters.id', '=', 'verses.chapter_id');
            })
            ->where('books.book_title', '=', 'Isaiah IIT')
            ->where(function($query) use ($search_term) {
                $terms = explode(' ', $search_term);
                $term_count = count($terms);
                for($i = 0; $i < $term_count; $i++) {
                    $query->where('verses.scripture_text', 'LIKE', '%' . $terms[$i] . '%', 'and');
                }
            })
            ->select(array(DB::raw('COUNT(chapters.id) as results')))->get();

        return array('results' => $results, 'count' => $count_result[0]->results);

        /*$queries = DB::getQueryLog();
        $last_query = end($queries);
        echo $last_query['query'];
        dd($last_query);*/
    }

    /**
     * Strip a string from the end of a string
     *
     * @param mixed $message the input string
     * @param mixed $strip string to remove
     *
     * @return string the modified string
     */
    private function _strrtrim($message, $strip) {
        $lines = explode($strip, $message);
        $last  = '';
        do {
            $last = array_pop($lines);
        } while (empty($last) && (count($lines)));
        return implode($strip, array_merge($lines, array($last)));
    }
} 