const props=[
    'href',
    'protocol',
    'hostname',
    'port',
    'pathname',
    'search',
    'hash',
    'origin',
]

const renderLocation = ()=>{
    const tbody = document.querySelector('#tbody')
    tbody.innerHTML= props.map((name)=>`
    <tr>
        <td>location.${name}</td>
        <td>${window.location[name] || 'EMPTY'}</td>
    </tr>
    `).join('\n')
}
document.addEventListener("DOMContentLoaded", renderLocation);
