

const file = document.getElementById('file-upload');
const tableNameElement = document.getElementById('table-name');
const columnInfoElem = document.getElementById('column-info');
let columnInfo = null;

function str2Array(str) {
  var array = [],i,il=str.length;
  for(i=0;i<il;i++) array.push(str.charCodeAt(i));
  return array;
}

const toCsvText = (result) => {
  const sjisArray = str2Array(result);
  const uniArray = Encoding.convert(sjisArray, 'UNICODE', 'SJIS');
  const text = Encoding.codeToString(uniArray);

  return text;
}


columnInfoElem.addEventListener('change', (ev) => {
  const read = new FileReader();
  reader.readAsBinaryString(ev.target.files[0]);

  reader.onload = (event) => {
    const text = toCsvText(event.target.result);
    const rows = text.split(/\n/);
    const detail = rows.splice(1);

    const results = detail.map(d => ({
      name: d[0],
      type: d[1],
    }));
    columnInfo = results;
  };
})


file.addEventListener('change', (ev) => {

  const tableName = tableNameElement.value;
  const reader = new FileReader();
  reader.readAsBinaryString(ev.target.files[0]);

  reader.onload = (event) => {
    const text = toCsvText(event.target.result);
    
    const rows = text.split(/\n/);
    const headerArray = rows[0].split(',');
    const header = headerArray.map(x => x.replace(/"/g, ''));
    const body = rows.splice(1);

    const sqlSentence = `INSERT INTO ${tableName} (${header.join(',')})`;

    const sql = body.map((item) => {
      const row = item.split(',').map(m => m.replace(/"/g, ''));
      console.log(`[log] row.length is ${row.length} `);

      const values = row.map(r => r === '' ? 'null' : r);
      const addEmptyCell = () => {
        if (values.length === header.length) {
          return;
        }
        values.push('null');
        addEmptyCell();
      };
      addEmptyCell();
      
      return `${sqlSentence} VALUES(${values});`;
    });

    const resultArea = document.getElementById('result-area');
    resultArea.innerText = sql.join('\n');
    
  };
});